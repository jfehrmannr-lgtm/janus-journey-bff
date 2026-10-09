import { describe, expect, it, jest } from '@jest/globals'
import { MsJourneysClient } from '@journeys/clients/ms-journeys.client.js'
import { FoldersService } from './folders.service.js'

describe('FoldersService', () => {
  it('delegates Folder operations to the Folder client methods', async () => {
    const createFolder = jest.fn().mockResolvedValue({})
    const findAllFolders = jest
      .fn()
      .mockResolvedValue({ status: 200, headers: {}, body: { items: [], totalRecords: 0 } })
    const findFolderByUid = jest.fn().mockResolvedValue({})
    const updateFolder = jest.fn().mockResolvedValue({})
    const removeFolder = jest.fn().mockResolvedValue({})
    const client = {
      createFolder,
      findAllFolders,
      findFolderByUid,
      updateFolder,
      removeFolder
    } as unknown as MsJourneysClient
    const service = new FoldersService(client)

    await service.create({ name: 'Folder', parentUid: 'journey-1' })
    await service.findAll({ page: 1, size: 20 })
    await service.findByUid('folder-1')
    await service.update('folder-1', { name: 'Updated' })
    await service.remove('folder-1')

    expect(createFolder).toHaveBeenCalledWith({ name: 'Folder', parentUid: 'journey-1' })
    expect(findAllFolders).toHaveBeenCalledWith({ page: 1, size: 20 })
    expect(findFolderByUid).toHaveBeenCalledWith('folder-1')
    expect(updateFolder).toHaveBeenCalledWith('folder-1', { name: 'Updated' })
    expect(removeFolder).toHaveBeenCalledWith('folder-1')
  })
})
