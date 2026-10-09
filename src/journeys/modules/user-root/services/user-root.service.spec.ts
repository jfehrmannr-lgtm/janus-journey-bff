import { describe, expect, it, jest } from '@jest/globals'
import { UserRootService } from './user-root.service.js'

describe('UserRootService', () => {
  it('uses the validated identity subject to request User root resources', async () => {
    const findUserRoot = jest.fn().mockResolvedValue({
      status: 200,
      body: { items: { folders: [], journeys: [], tasks: [] }, registers: 0 },
      headers: {}
    })
    const service = new UserRootService({ findUserRoot } as never)

    const result = await service.findRoot({ sub: 'subject-123' })

    expect(findUserRoot).toHaveBeenCalledWith('subject-123')
    expect(result.body).toEqual({ payload: { folders: [], journeys: [], tasks: [] }, registers: 0 })
  })

  it('maps successful resource responses to the BFF payload convention', async () => {
    const findResource = jest.fn().mockResolvedValue({
      body: { items: { uid: 'journey-1', type: 'journey', folders: [], tasks: [] } },
      headers: {},
      status: 200
    })
    const service = new UserRootService({ findResource } as never)

    await expect(service.findResource('journey', 'journey-1')).resolves.toEqual({
      body: { payload: { uid: 'journey-1', type: 'journey', folders: [], tasks: [] } },
      headers: {},
      status: 200
    })
    expect(findResource).toHaveBeenCalledWith('journey', 'journey-1')
  })

  it('preserves resource retrieval errors from ms-journeys', async () => {
    const findResource = jest.fn().mockResolvedValue({
      body: { message: 'resource unavailable' },
      headers: {},
      status: 502
    })
    const service = new UserRootService({ findResource } as never)

    await expect(service.findResource('folder', 'folder-1')).resolves.toEqual({
      body: { message: 'resource unavailable' },
      headers: {},
      status: 502
    })
  })
})
