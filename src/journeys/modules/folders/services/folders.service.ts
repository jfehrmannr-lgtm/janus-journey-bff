import { Injectable } from '@nestjs/common'
import { MsJourneysClient } from '@journeys/clients/ms-journeys.client.js'
import type { DownstreamResponse } from '@journeys/types/ms-journeys.types.js'
import type { CreateFolderDto } from '../dto/create-folder.dto.js'
import type { UpdateFolderDto } from '../dto/update-folder.dto.js'
import type { PaginationQueryDto } from '@common/collections/pagination-query.dto.js'
import type { CollectionResponse } from '@common/collections/collection.types.js'
import { effectivePageSize } from '@common/collections/pagination-query.dto.js'
import { parseCollectionResult } from '@common/collections/collection.parser.js'
import { buildCollectionResponse } from '@common/collections/collection.builder.js'

@Injectable()
export class FoldersService {
  constructor(private readonly client: MsJourneysClient) {}

  create(payload: CreateFolderDto): Promise<DownstreamResponse> {
    return this.client.createFolder(payload)
  }

  async findAll(
    query: PaginationQueryDto
  ): Promise<DownstreamResponse<CollectionResponse<unknown, Record<string, never>>>> {
    const page = Number(query.page)
    const size = effectivePageSize(Number(query.size))
    const result = await this.client.findAllFolders({ page, size })
    if (result.status < 200 || result.status >= 300)
      return result as DownstreamResponse<CollectionResponse<unknown, Record<string, never>>>
    const collection = parseCollectionResult(result.body)
    return { ...result, body: buildCollectionResponse(collection.items, collection.totalRecords, page, size, {}) }
  }

  findByUid(uid: string): Promise<DownstreamResponse> {
    return this.client.findFolderByUid(uid)
  }

  replace(uid: string, payload: UpdateFolderDto): Promise<DownstreamResponse> {
    return this.client.replaceFolder(uid, payload)
  }

  update(uid: string, payload: UpdateFolderDto): Promise<DownstreamResponse> {
    return this.client.updateFolder(uid, payload)
  }

  remove(uid: string): Promise<DownstreamResponse> {
    return this.client.removeFolder(uid)
  }
}
