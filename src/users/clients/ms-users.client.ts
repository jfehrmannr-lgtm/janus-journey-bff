import { BadGatewayException, GatewayTimeoutException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpClient, HttpNetworkError, HttpTimeoutError, type HttpQuery, type HttpResponse } from '@nestjs/http-client'
import type { AuthenticatedIdentity } from '../../auth/types/authenticated-identity.js'
import type {
  AuthenticatedMsUsersRequest,
  DownstreamResponse,
  MsUsersRequestOptions,
  UserPayload
} from '../types/ms-users.types.js'

export const AUTHENTICATED_SUBJECT_HEADER = 'x-authenticated-subject'

@Injectable()
export class MsUsersClient {
  private readonly baseUrl: string
  private readonly timeout: number

  constructor(
    private readonly http: HttpClient,
    config: ConfigService
  ) {
    this.baseUrl = config.getOrThrow<string>('MS_USERS_BASE_URL').replace(/\/+$/, '')
    this.timeout = config.getOrThrow<number>('MS_USERS_TIMEOUT_MS')
  }

  create(payload: UserPayload, authenticatedIdentity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.send('POST', '/users', { authenticatedIdentity }, payload)
  }

  findAll(
    authenticatedIdentity: AuthenticatedIdentity,
    options: MsUsersRequestOptions = {}
  ): Promise<DownstreamResponse> {
    return this.send('GET', '/users', { ...options, authenticatedIdentity })
  }

  findById(resourceId: string, authenticatedIdentity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.send('GET', `/users/${encodeURIComponent(resourceId)}`, { authenticatedIdentity })
  }

  update(
    resourceId: string,
    payload: UserPayload,
    authenticatedIdentity: AuthenticatedIdentity
  ): Promise<DownstreamResponse> {
    return this.send('PATCH', `/users/${encodeURIComponent(resourceId)}`, { authenticatedIdentity }, payload)
  }

  remove(resourceId: string, authenticatedIdentity: AuthenticatedIdentity): Promise<DownstreamResponse> {
    return this.send('DELETE', `/users/${encodeURIComponent(resourceId)}`, { authenticatedIdentity })
  }

  private async send(
    method: string,
    path: string,
    request: AuthenticatedMsUsersRequest,
    payload?: UserPayload
  ): Promise<DownstreamResponse> {
    try {
      const response = await this.http.request<Response>(this.url(path), {
        method,
        query: this.toQuery(request),
        headers: {
          accept: 'application/json',
          [AUTHENTICATED_SUBJECT_HEADER]: request.authenticatedIdentity.sub
        },
        ...(payload === undefined ? {} : { json: payload }),
        responseType: 'response',
        retry: false,
        throwOnHttpError: false,
        timeout: this.timeout
      })

      return this.toDownstreamResponse(response)
    } catch (error: unknown) {
      if (error instanceof HttpTimeoutError) {
        throw new GatewayTimeoutException('The ms-users request timed out')
      }

      if (error instanceof HttpNetworkError) {
        throw new BadGatewayException('The ms-users service could not be reached')
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

    return {
      body,
      headers,
      status: response.data.status
    }
  }

  private parseJson(value: string): unknown {
    try {
      return JSON.parse(value) as unknown
    } catch {
      return value
    }
  }

  private toQuery(request: AuthenticatedMsUsersRequest): HttpQuery | undefined {
    const query: Record<string, string | number | boolean | readonly (string | number | boolean)[]> = {}

    for (const [key, value] of Object.entries(request.params ?? {})) {
      const normalized = this.normalizeQueryValue(value)

      if (normalized !== undefined) {
        query[key] = normalized
      }
    }

    return Object.keys(query).length > 0 ? query : undefined
  }

  private normalizeQueryValue(
    value: unknown
  ): string | number | boolean | readonly (string | number | boolean)[] | undefined {
    if (value === undefined || value === null) {
      return undefined
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.stringifyQueryValue(item))
    }

    return this.stringifyQueryValue(value)
  }

  private stringifyQueryValue(value: unknown): string {
    if (typeof value === 'string') {
      return value
    }

    if (value instanceof Date) {
      return value.toISOString()
    }

    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return String(value)
    }

    return JSON.stringify(value) ?? String(value)
  }

  private url(path: string): string {
    return `${this.baseUrl}${path}`
  }
}
