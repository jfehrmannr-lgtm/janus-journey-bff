import { Injectable } from '@nestjs/common'
import type { AuthenticatedIdentity } from '@auth/types/authenticated-identity.js'
import { MsJourneysClient } from '@journeys/clients/ms-journeys.client.js'
import type { BulkCreateTaskItemDto } from '../dto/bulk-create-task.dto.js'
import type { DownstreamResponse } from '@journeys/types/ms-journeys.types.js'
import type { CreateTaskDto } from '../dto/create-task.dto.js'
import type { UpdateTaskDto } from '../dto/update-task.dto.js'
import type { PaginationQueryDto } from '@common/collections/pagination-query.dto.js'
import type { CollectionResponse } from '@common/collections/collection.types.js'
import { effectivePageSize } from '@common/collections/pagination-query.dto.js'
import { parseCollectionResult } from '@common/collections/collection.parser.js'
import { buildCollectionResponse } from '@common/collections/collection.builder.js'
import { resolveParent } from '@journeys/utils/resolve-parent.js'

@Injectable()
export class TasksService {
  constructor(private readonly client: MsJourneysClient) {}

  create(payload: CreateTaskDto, identity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.client.createTask({ ...payload, parent: resolveParent(payload.parent, identity.sub) }, identity)
  }

  async createBulk(items: BulkCreateTaskItemDto[], identity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    const resolvedItems = items.map((item) => ({ ...item, parent: resolveParent(item.parent, identity.sub) }))
    return this.client.createTasksBulk(resolvedItems, identity)
  }

  async findAll(
    query: PaginationQueryDto,
    identity: AuthenticatedIdentity
  ): Promise<DownstreamResponse<CollectionResponse<unknown, Record<string, never>>>> {
    const page = Number(query.page)
    const size = effectivePageSize(Number(query.size))
    const result = await this.client.findAllTasks({ page, size }, identity)
    if (result.status < 200 || result.status >= 300)
      return result as DownstreamResponse<CollectionResponse<unknown, Record<string, never>>>
    const collection = parseCollectionResult(result.body)
    return { ...result, body: buildCollectionResponse(collection.items, collection.totalRecords, page, size, {}) }
  }

  findByUid(uid: string, identity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.client.findTaskByUid(uid, identity)
  }

  update(uid: string, payload: UpdateTaskDto, identity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.client.updateTask(uid, payload, identity)
  }

  remove(uid: string, identity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.client.removeTask(uid, identity)
  }

  deleteBulk(ids: string[], identity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.client.removeTasksBulk(ids, identity)
  }
}
