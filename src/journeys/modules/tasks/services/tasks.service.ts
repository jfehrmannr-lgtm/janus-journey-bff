import { Injectable } from '@nestjs/common'
import { MsJourneysClient } from '../../../clients/ms-journeys.client.js'
import type { DownstreamResponse } from '../../../types/ms-journeys.types.js'
import type { CreateTaskDto } from '../dto/create-task.dto.js'
import type { UpdateTaskDto } from '../dto/update-task.dto.js'

@Injectable()
export class TasksService {
  constructor(private readonly client: MsJourneysClient) {}

  create(payload: CreateTaskDto): Promise<DownstreamResponse> {
    return this.client.createTask(payload)
  }

  findAll(): Promise<DownstreamResponse> {
    return this.client.findAllTasks()
  }

  findByUid(uid: string): Promise<DownstreamResponse> {
    return this.client.findTaskByUid(uid)
  }

  replace(uid: string, payload: UpdateTaskDto): Promise<DownstreamResponse> {
    return this.client.replaceTask(uid, payload)
  }

  update(uid: string, payload: UpdateTaskDto): Promise<DownstreamResponse> {
    return this.client.updateTask(uid, payload)
  }

  remove(uid: string): Promise<DownstreamResponse> {
    return this.client.removeTask(uid)
  }
}
