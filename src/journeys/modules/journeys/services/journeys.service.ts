import { BadGatewayException, BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MsJourneysClient } from '@journeys/clients/ms-journeys.client.js'
import type { AuthenticatedIdentity } from '@auth/types/authenticated-identity.js'
import { resolveParent } from '@journeys/utils/resolve-parent.js'
import type { CreateJourneyDto } from '../dto/create-journey.dto.js'
import type { ComposeFolderDto, ComposeJourneyDto, ComposeTaskDto } from '../dto/compose-journey.dto.js'
import type { BulkCreateFolderItemDto } from '../../folders/dto/bulk-create-folder.dto.js'
import type { BulkCreateTaskItemDto } from '../../tasks/dto/bulk-create-task.dto.js'
import { FoldersService } from '../../folders/services/folders.service.js'
import { TasksService } from '../../tasks/services/tasks.service.js'
import type { UpdateJourneyDto } from '../dto/update-journey.dto.js'
import type { DownstreamResponse } from '@journeys/types/ms-journeys.types.js'
import type { PaginationQueryDto } from '@common/collections/pagination-query.dto.js'
import type { CollectionResponse } from '@common/collections/collection.types.js'
import { effectivePageSize } from '@common/collections/pagination-query.dto.js'
import { parseCollectionResult } from '@common/collections/collection.parser.js'
import { buildCollectionResponse } from '@common/collections/collection.builder.js'

@Injectable()
export class JourneysService {
  private readonly logger = new Logger(JourneysService.name)

  constructor(
    private readonly client: MsJourneysClient,
    private readonly foldersService: FoldersService,
    private readonly tasksService: TasksService
  ) {}

  create(payload: CreateJourneyDto, identity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.client.createJourney({ ...payload, parent: resolveParent(payload.parent, identity.sub) }, identity)
  }

  async compose(payload: ComposeJourneyDto, identity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    this.validateComposeFolders(payload.folders)

    const journeyResult = await this.create(
      { description: payload.description, imgUrl: payload.imgUrl, metadata: payload.metadata, name: payload.name },
      identity
    )

    if (!this.isSuccessful(journeyResult)) return journeyResult

    const journeyUid = this.extractUid(journeyResult.body, 'created Journey')

    try {
      const folders = payload.folders ?? []
      const folderUids = new Map<string, string>()

      if (folders.length > 0) {
        const folderItems: BulkCreateFolderItemDto[] = folders.map(
          ({ clientId, description, metadata, name, orderIndex }) => ({
            clientId,
            description,
            metadata,
            name,
            orderIndex,
            parent: { type: 'journey', uid: journeyUid }
          })
        )
        const folderResult = await this.foldersService.createBulk(folderItems, identity)

        if (!this.isSuccessful(folderResult)) {
          await this.compensateJourney(journeyUid, identity)
          return folderResult
        }

        const createdFolders = this.extractCorrelatedItems(folderResult.body, 'created Folders')
        for (const folder of folders) {
          const createdFolder = createdFolders.find((item) => item.clientId === folder.clientId)
          if (!createdFolder) {
            throw new BadGatewayException(`The created Folder for clientId ${folder.clientId} was not returned`)
          }
          folderUids.set(folder.clientId, this.extractUid(createdFolder.resource, `Folder ${folder.clientId}`))
        }
      }

      const rootTaskItems = (payload.tasks ?? []).map((task) =>
        this.toTaskItem(task, { type: 'journey', uid: journeyUid })
      )

      const folderTaskItems = folders.flatMap((folder) => {
        const folderUid = folderUids.get(folder.clientId) ?? ''

        return (folder.tasks ?? []).map((task) => this.toTaskItem(task, { type: 'folder', uid: folderUid }))
      })

      const taskItems: BulkCreateTaskItemDto[] = [...rootTaskItems, ...folderTaskItems]

      if (taskItems.length > 0) {
        const taskResult = await this.tasksService.createBulk(taskItems, identity)
        if (!this.isSuccessful(taskResult)) {
          await this.compensateJourney(journeyUid, identity)
          return taskResult
        }
      }

      return journeyResult
    } catch (error: unknown) {
      await this.compensateJourney(journeyUid, identity)
      throw error
    }
  }

  async findAll(
    query: PaginationQueryDto,
    identity: AuthenticatedIdentity
  ): Promise<DownstreamResponse<CollectionResponse<unknown, Record<string, never>>>> {
    const page = Number(query.page)
    const size = effectivePageSize(Number(query.size))
    const result = await this.client.findAllJourneys({ page, size }, identity)
    if (result.status < 200 || result.status >= 300)
      return result as DownstreamResponse<CollectionResponse<unknown, Record<string, never>>>
    const collection = parseCollectionResult(result.body)
    return { ...result, body: buildCollectionResponse(collection.items, collection.totalRecords, page, size, {}) }
  }

  findByUid(uid: string, identity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.client.findJourneyByUid(uid, identity)
  }

  update(uid: string, payload: UpdateJourneyDto, identity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.client.updateJourney(uid, payload, identity)
  }

  remove(uid: string, identity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.client.removeJourney(uid, identity)
  }

  private validateComposeFolders(folders: ComposeFolderDto[] | undefined): void {
    const clientIds = new Set<string>()

    for (const folder of folders ?? []) {
      if (typeof folder.clientId !== 'string' || folder.clientId.trim() === '') {
        throw new BadRequestException('Every Compose Folder must include a non-empty clientId')
      }
      if (clientIds.has(folder.clientId)) {
        throw new BadRequestException(`Compose Folder clientId values must be unique: ${folder.clientId}`)
      }
      clientIds.add(folder.clientId)
    }
  }

  private toTaskItem(task: ComposeTaskDto, parent: { uid: string; type: 'journey' | 'folder' }): BulkCreateTaskItemDto {
    return { ...task, parent }
  }

  private isSuccessful(result: DownstreamResponse): boolean {
    return result.status >= 200 && result.status < 300
  }

  private extractUid(body: unknown, resourceName: string): string {
    if (this.isRecord(body) && typeof body.uid === 'string' && body.uid !== '') return body.uid
    throw new BadGatewayException(`The ms-journeys response did not include the UID for the ${resourceName}`)
  }

  private extractCorrelatedItems(body: unknown, resourceName: string): Array<{ clientId?: string; resource: unknown }> {
    if (this.isRecord(body) && Array.isArray(body.items)) {
      return body.items.filter(
        (item): item is { clientId?: string; resource: unknown } => this.isRecord(item) && 'resource' in item
      )
    }
    throw new BadGatewayException(`The ms-journeys response did not include the ${resourceName}`)
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  private async compensateJourney(uid: string, identity: AuthenticatedIdentity): Promise<void> {
    try {
      const result = await this.remove(uid, identity)
      if (!this.isSuccessful(result)) {
        this.logger.error(`Compose Journey compensation failed for ${uid}: DELETE returned ${result.status}`)
      }
    } catch (error: unknown) {
      this.logger.error(
        `Compose Journey compensation failed for ${uid}`,
        error instanceof Error ? error.stack : String(error)
      )
    }
  }
}
