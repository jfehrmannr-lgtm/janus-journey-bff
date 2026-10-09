import { BadGatewayException, GatewayTimeoutException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpClient, HttpNetworkError, HttpTimeoutError, type HttpQuery, type HttpResponse } from '@nestjs/http-client'
import type { CreateFolderDto } from '../modules/folders/dto/create-folder.dto.js'
import type { UpdateFolderDto } from '../modules/folders/dto/update-folder.dto.js'
import type { CreateJourneyDto } from '../modules/journeys/dto/create-journey.dto.js'
import type { UpdateJourneyDto } from '../modules/journeys/dto/update-journey.dto.js'
import type { CreateTaskDto } from '../modules/tasks/dto/create-task.dto.js'
import type { UpdateTaskDto } from '../modules/tasks/dto/update-task.dto.js'
import type { DownstreamResponse } from '../types/ms-journeys.types.js'
import type { PaginationQueryDto } from '@common/collections/pagination-query.dto.js'

@Injectable()
export class MsJourneysClient {
  private readonly baseUrl: string
  private readonly timeout: number

  constructor(
    private readonly http: HttpClient,
    config: ConfigService
  ) {
    this.baseUrl = config.getOrThrow<string>('MS_JOURNEYS_BASE_URL').replace(/\/+$/, '')
    this.timeout = config.getOrThrow<number>('MS_JOURNEYS_TIMEOUT_MS')
  }

  createJourney(payload: CreateJourneyDto): Promise<DownstreamResponse> {
    return this.send('POST', '/journeys', payload)
  }

  findAllJourneys(query: PaginationQueryDto): Promise<DownstreamResponse> {
    return this.send('GET', '/journeys', undefined, query)
  }

  findJourneyByUid(uid: string): Promise<DownstreamResponse> {
    return this.send('GET', this.resourceUrl('/journeys', uid))
  }

  updateJourney(uid: string, payload: UpdateJourneyDto): Promise<DownstreamResponse> {
    return this.send('PATCH', this.resourceUrl('/journeys', uid), payload)
  }

  removeJourney(uid: string): Promise<DownstreamResponse> {
    return this.send('DELETE', this.resourceUrl('/journeys', uid))
  }

  createFolder(payload: CreateFolderDto): Promise<DownstreamResponse> {
    return this.send('POST', '/folders', payload)
  }

  findAllFolders(query: PaginationQueryDto): Promise<DownstreamResponse> {
    return this.send('GET', '/folders', undefined, query)
  }

  findFolderByUid(uid: string): Promise<DownstreamResponse> {
    return this.send('GET', this.resourceUrl('/folders', uid))
  }

  updateFolder(uid: string, payload: UpdateFolderDto): Promise<DownstreamResponse> {
    return this.send('PATCH', this.resourceUrl('/folders', uid), payload)
  }

  removeFolder(uid: string): Promise<DownstreamResponse> {
    return this.send('DELETE', this.resourceUrl('/folders', uid))
  }

  createTask(payload: CreateTaskDto): Promise<DownstreamResponse> {
    return this.send('POST', '/tasks', payload)
  }

  findAllTasks(query: PaginationQueryDto): Promise<DownstreamResponse> {
    return this.send('GET', '/tasks', undefined, query)
  }

  findTaskByUid(uid: string): Promise<DownstreamResponse> {
    return this.send('GET', this.resourceUrl('/tasks', uid))
  }

  updateTask(uid: string, payload: UpdateTaskDto): Promise<DownstreamResponse> {
    return this.send('PATCH', this.resourceUrl('/tasks', uid), payload)
  }

  removeTask(uid: string): Promise<DownstreamResponse> {
    return this.send('DELETE', this.resourceUrl('/tasks', uid))
  }

  private async send(
    method: string,
    path: string,
    payload?: object,
    query?: PaginationQueryDto
  ): Promise<DownstreamResponse> {
    try {
      const response = await this.http.request<Response>(this.url(path), {
        method,
        ...(query === undefined ? {} : { query: query as unknown as HttpQuery }),
        headers: { accept: 'application/json' },
        ...(payload === undefined ? {} : { json: payload }),
        responseType: 'response',
        retry: false,
        throwOnHttpError: false,
        timeout: this.timeout
      })

      return this.toDownstreamResponse(response)
    } catch (error: unknown) {
      if (error instanceof HttpTimeoutError) {
        throw new GatewayTimeoutException('The ms-journeys request timed out')
      }

      if (error instanceof HttpNetworkError) {
        throw new BadGatewayException('The ms-journeys service could not be reached')
      }

      throw error
    }
  }

  private async toDownstreamResponse(response: HttpResponse<Response>): Promise<DownstreamResponse> {
    const contentType = response.data.headers.get('content-type') ?? ''
    const text = await response.data.text()
    const body = contentType.includes('application/json') && text !== '' ? this.parseJson(text) : text || undefined
    const headers: Record<string, string> = {}

    for (const name of ['content-type', 'location']) {
      const value = response.data.headers.get(name)

      if (value) {
        headers[name] = value
      }
    }

    return { body, headers, status: response.data.status }
  }

  private parseJson(value: string): unknown {
    try {
      return JSON.parse(value) as unknown
    } catch {
      return value
    }
  }

  private resourceUrl(resource: string, uid: string): string {
    return `${resource}/${encodeURIComponent(uid)}`
  }

  private url(path: string): string {
    return `${this.baseUrl}${path}`
  }
}
