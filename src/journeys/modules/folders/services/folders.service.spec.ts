import { describe, expect, it, jest } from '@jest/globals'
import { MsJourneysClient } from '@journeys/clients/ms-journeys.client.js'
import { FoldersService } from './folders.service.js'
import { BadRequestException } from '@nestjs/common'

describe('FoldersService', () => {
  it('delegates Folder operations to the Folder client methods', async () => {
    const createFolder = jest.fn().mockResolvedValue({})
    const findAllFolders = jest
      .fn()
      .mockResolvedValue({ status: 200, headers: {}, body: { items: [], totalRecords: 0 } })
    const findFolderByUid = jest.fn().mockResolvedValue({})
    const updateFolder = jest.fn().mockResolvedValue({})
    const removeFolder = jest.fn().mockResolvedValue({})
    const removeFoldersBulk = jest.fn().mockResolvedValue({})
    const client = {
      createFolder,
      findAllFolders,
      findFolderByUid,
      updateFolder,
      removeFolder,
      removeFoldersBulk
    } as unknown as MsJourneysClient
    const service = new FoldersService(client)

    await service.create({ name: 'Folder', parent: { type: 'journey', uid: 'journey-1' } }, { sub: 'user-1' })
    await service.findAll({ page: 1, size: 20 })
    await service.findByUid('folder-1')
    await service.update('folder-1', { name: 'Updated' })
    await service.remove('folder-1')
    await service.deleteBulk(['folder-1', 'folder-2'])

    expect(createFolder).toHaveBeenCalledWith({ name: 'Folder', parent: { type: 'journey', uid: 'journey-1' } })
    expect(findAllFolders).toHaveBeenCalledWith({ page: 1, size: 20 })
    expect(findFolderByUid).toHaveBeenCalledWith('folder-1')
    expect(updateFolder).toHaveBeenCalledWith('folder-1', { name: 'Updated' })
    expect(removeFolder).toHaveBeenCalledWith('folder-1')
    expect(removeFoldersBulk).toHaveBeenCalledWith(['folder-1', 'folder-2'])
  })

  it('resolves omitted parents to the authenticated User and preserves resource parents', async () => {
    const createFoldersBulk = jest.fn().mockResolvedValue({})
    const client = { createFoldersBulk } as unknown as MsJourneysClient
    const service = new FoldersService(client)

    await service.createBulk(
      [{ name: 'Owned Folder' }, { name: 'Journey Folder', parent: { type: 'journey', uid: 'journey-1' } }],
      { sub: 'user-1' }
    )

    expect(createFoldersBulk).toHaveBeenCalledWith([
      { name: 'Owned Folder', parent: { type: 'user', uid: 'user-1' } },
      { name: 'Journey Folder', parent: { type: 'journey', uid: 'journey-1' } }
    ])
  })

  it('rejects explicit User parents before calling ms-journeys', async () => {
    const createFoldersBulk = jest.fn()
    const service = new FoldersService({ createFoldersBulk } as unknown as MsJourneysClient)

    await expect(
      service.createBulk([{ name: 'Invalid', parent: { type: 'user', uid: 'other-user' } }], { sub: 'user-1' })
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(createFoldersBulk).not.toHaveBeenCalled()
  })
})
