import { describe, expect, it, jest } from '@jest/globals'
import { MsUsersClient } from '../clients/ms-users.client.js'
import { UsersService } from './users.service.js'

describe('UsersService', () => {
  it('propagates the authenticated identity to the client', async () => {
    const findById = jest.fn().mockResolvedValue({ body: { userId: 'user-1' }, headers: {}, status: 200 })
    const client = {
      findById
    } as unknown as MsUsersClient
    const service = new UsersService(client)

    await service.findById({ sub: 'subject-1' }, 'user-1')

    expect(findById).toHaveBeenCalledWith('user-1', { sub: 'subject-1' })
  })
})
