import { ConfigService } from '@nestjs/config'
import { HttpClient, HttpTimeoutError } from '@nestjs/http-client'
import { describe, expect, it, jest } from '@jest/globals'
import { MsJourneysClient } from './ms-journeys.client.js'

const createClient = (request: ReturnType<typeof jest.fn>): MsJourneysClient => {
  const http = { request } as unknown as HttpClient
  const config = {
    getOrThrow: (key: string) =>
      ({
        MS_JOURNEYS_BASE_URL: 'http://localhost:4002/',
        MS_JOURNEYS_TIMEOUT_MS: 5000,
        MS_JOURNEYS_API_KEY: 'journey-service-api-key'
      })[key]
  } as unknown as ConfigService

  return new MsJourneysClient(http, config)
}

const response = (body: unknown = { uid: 'journey-1' }, status = 200) => ({
  data: new Response(status === 204 ? null : JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status
  })
})

const identity = { sub: 'subject-1' }

describe('MsJourneysClient', () => {
  it('forwards bulk deletion payloads to the corresponding resource endpoints', async () => {
    const request = jest.fn().mockImplementation(() => Promise.resolve(response(undefined, 204)))
    const client = createClient(request)

    await client.removeFoldersBulk(['folder-1', 'folder-2'], identity)
    await client.removeTasksBulk(['task-1', 'task-2'], identity)

    expect(
      request.mock.calls.map(([url, options]) => ({
        method: (options as { method: string }).method,
        url,
        json: (options as { json: unknown }).json
      }))
    ).toEqual([
      { method: 'DELETE', url: 'http://localhost:4002/folders/bulk', json: { ids: ['folder-1', 'folder-2'] } },
      { method: 'DELETE', url: 'http://localhost:4002/tasks/bulk', json: { ids: ['task-1', 'task-2'] } }
    ])
  })

  it('forwards resource-specific CRUD requests using domain UIDs', async () => {
    const request = jest.fn().mockImplementation(() => Promise.resolve(response()))
    const client = createClient(request)

    await client.createJourney({ name: 'Journey', parent: { type: 'user', uid: 'user-1' } }, identity)
    await client.createFoldersBulk([{ name: 'Folder', parent: { type: 'journey', uid: 'journey-1' } }], identity)
    await client.findAllFolders({ page: 1, size: 20 }, identity)
    await client.createTasksBulk(
      [{ isVisible: true, name: 'Task', parent: { type: 'user', uid: 'user-1' }, state: 'pending' }],
      identity
    )
    await client.findTaskByUid('task/1', identity)
    await client.findUserRoot('user/1', identity)
    await client.findResource('journey', 'journey/1', identity)
    await client.updateJourney('journey-1', { name: 'Updated' }, identity)
    await client.updateFolder('folder-1', { metadata: { source: 'test' } }, identity)
    await client.removeTask('task-1', identity)

    expect(
      request.mock.calls.map(([url, options]) => ({
        method: (options as { method: string }).method,
        url
      }))
    ).toEqual([
      { method: 'POST', url: 'http://localhost:4002/journeys' },
      { method: 'POST', url: 'http://localhost:4002/folders/bulk' },
      { method: 'GET', url: 'http://localhost:4002/folders' },
      { method: 'POST', url: 'http://localhost:4002/tasks/bulk' },
      { method: 'GET', url: 'http://localhost:4002/tasks/task%2F1' },
      { method: 'GET', url: 'http://localhost:4002/users/user%2F1/root' },
      { method: 'GET', url: 'http://localhost:4002/users/resources/journey/journey%2F1' },
      { method: 'PATCH', url: 'http://localhost:4002/journeys/journey-1' },
      { method: 'PATCH', url: 'http://localhost:4002/folders/folder-1' },
      { method: 'DELETE', url: 'http://localhost:4002/tasks/task-1' }
    ])

    const [, options] = request.mock.calls[0] as unknown as [string, { headers: Record<string, string> }]
    expect(options.headers).toEqual({
      accept: 'application/json',
      'X-API-Key': 'journey-service-api-key',
      'X-User-Id': 'subject-1'
    })
    for (const [, requestOptions] of request.mock.calls) {
      expect((requestOptions as { headers: Record<string, string> }).headers).toMatchObject({
        'X-API-Key': 'journey-service-api-key',
        'X-User-Id': 'subject-1'
      })
    }

    expect((request.mock.calls[1][1] as { json: unknown }).json).toEqual({
      items: [{ name: 'Folder', parent: { type: 'journey', uid: 'journey-1' } }]
    })
    expect((request.mock.calls[3][1] as { json: unknown }).json).toEqual({
      items: [{ isVisible: true, name: 'Task', parent: { type: 'user', uid: 'user-1' }, state: 'pending' }]
    })
  })

  it('preserves downstream responses and maps timeouts', async () => {
    const request = jest.fn().mockResolvedValue(response({ message: 'not found' }, 404))
    const client = createClient(request)

    await expect(client.findJourneyByUid('missing', identity)).resolves.toMatchObject({
      body: { message: 'not found' },
      status: 404
    })

    const timeoutRequest = jest
      .fn()
      .mockRejectedValue(
        new HttpTimeoutError({ method: 'GET', timeoutMs: 5000, url: 'http://localhost:4002/journeys' })
      )
    const timeoutClient = createClient(timeoutRequest)

    await expect(timeoutClient.findAllJourneys({ page: 1, size: 20 }, identity)).rejects.toMatchObject({ status: 504 })
  })

  it('fails construction when the internal API key is missing', () => {
    const http = { request: jest.fn() } as unknown as HttpClient
    const config = {
      getOrThrow: (key: string) =>
        key === 'MS_JOURNEYS_API_KEY'
          ? undefined
          : {
              MS_JOURNEYS_BASE_URL: 'http://localhost:4002',
              MS_JOURNEYS_TIMEOUT_MS: 5000
            }[key]
    } as unknown as ConfigService

    expect(() => new MsJourneysClient(http, config)).toThrow()
  })
})
