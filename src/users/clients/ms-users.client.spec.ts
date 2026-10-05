import { HttpClient, HttpTimeoutError } from '@nestjs/http-client'
import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi } from 'vitest'
import { MsUsersClient } from './ms-users.client.js'

const createClient = (request: ReturnType<typeof vi.fn>): MsUsersClient => {
  const http = { request } as unknown as HttpClient
  const config = {
    getOrThrow: (key: string) =>
      ({
        MS_USERS_BASE_URL: 'http://localhost:4001/',
        MS_USERS_TIMEOUT_MS: 5000
      })[key]
  } as unknown as ConfigService

  return new MsUsersClient(http, config)
}

describe('MsUsersClient', () => {
  it('passes normal query params to the generic collection REST boundary', async () => {
    const request = vi.fn().mockResolvedValue({
      data: new Response(JSON.stringify({ userId: 'user-1' }), {
        headers: { 'content-type': 'application/json' },
        status: 200
      })
    })
    const client = createClient(request)

    const result = await client.findAll({ sub: 'subject-1' }, { params: { page: 2, status: 'active' } })

    expect(request).toHaveBeenCalledTimes(1)

    const [url, options] = request.mock.calls[0] as unknown as [
      string,
      {
        headers: Record<string, string>
        query: Record<string, unknown>
        throwOnHttpError: boolean
      }
    ]

    expect(url).toBe('http://localhost:4001/users')
    expect(options.headers['x-authenticated-subject']).toBe('subject-1')
    expect(options.query).toEqual({ page: 2, status: 'active' })
    expect(options.throwOnHttpError).toBe(false)
    expect(result).toMatchObject({ body: { userId: 'user-1' }, status: 200 })
  })

  it('does not add query parameters to an item request', async () => {
    const request = vi.fn().mockResolvedValue({
      data: new Response(JSON.stringify({ userId: 'user-1' }), {
        headers: { 'content-type': 'application/json' },
        status: 200
      })
    })
    const client = createClient(request)

    await client.findById('user-1', { sub: 'subject-1' })

    expect(request.mock.calls[0]?.[1]).toEqual(expect.objectContaining({ query: undefined }))
  })

  it('preserves a downstream not-found response', async () => {
    const request = vi.fn().mockResolvedValue({
      data: new Response(JSON.stringify({ message: 'not found' }), {
        headers: { 'content-type': 'application/json' },
        status: 404
      })
    })
    const client = createClient(request)

    const result = await client.findById('missing', { sub: 'subject-1' })

    expect(result).toMatchObject({ body: { message: 'not found' }, status: 404 })
  })

  it('maps a downstream timeout to a gateway timeout', async () => {
    const request = vi
      .fn()
      .mockRejectedValue(new HttpTimeoutError({ method: 'GET', timeoutMs: 5000, url: 'http://localhost:4001/users' }))
    const client = createClient(request)

    await expect(client.findAll({ sub: 'subject-1' })).rejects.toMatchObject({ status: 504 })
  })
})
