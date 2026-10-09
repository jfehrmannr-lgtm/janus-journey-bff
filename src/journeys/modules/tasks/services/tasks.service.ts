import { Injectable } from '@nestjs/common'
import { MsJourneysClient } from '@journeys/clients/ms-journeys.client.js'
import type { DownstreamResponse } from '@journeys/types/ms-journeys.types.js'
import type { CreateTaskDto } from '../dto/create-task.dto.js'
import type { UpdateTaskDto } from '../dto/update-task.dto.js'
import type { PaginationQueryDto } from '@common/collections/pagination-query.dto.js'
import type { CollectionResponse } from '@common/collections/collection.types.js'
import { effectivePageSize } from '@common/collections/pagination-query.dto.js'
import { parseCollectionResult } from '@common/collections/collection.parser.js'
import { buildCollectionResponse } from '@common/collections/collection.builder.js'

@Injectable()
export class TasksService {
  constructor(private readonly client: MsJourneysClient) {}

  create(payload: CreateTaskDto): Promise<DownstreamResponse> {
    return this.client.createTask(payload)
  }

  async findAll(
    query: PaginationQueryDto
  ): Promise<DownstreamResponse<CollectionResponse<unknown, Record<string, never>>>> {
    const page = Number(query.page)
    const size = effectivePageSize(Number(query.size))
    const result = await this.client.findAllTasks({ page, size })
    if (result.status < 200 || result.status >= 300)
      return result as DownstreamResponse<CollectionResponse<unknown, Record<string, never>>>
    const collection = parseCollectionResult(result.body)
    return { ...result, body: buildCollectionResponse(collection.items, collection.totalRecords, page, size, {}) }
  }

  findByUid(uid: string): Promise<DownstreamResponse> {
    return this.client.findTaskByUid(uid)
  }

  update(uid: string, payload: UpdateTaskDto): Promise<DownstreamResponse> {
    return this.client.updateTask(uid, payload)
  }

  remove(uid: string): Promise<DownstreamResponse> {
    return this.client.removeTask(uid)
  }
}
