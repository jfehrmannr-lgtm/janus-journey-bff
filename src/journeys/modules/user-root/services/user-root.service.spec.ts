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
})
