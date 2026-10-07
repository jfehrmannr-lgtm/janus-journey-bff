import { describe, expect, it, jest } from '@jest/globals'
import { MsJourneysClient } from '../../../clients/ms-journeys.client.js'
import { FoldersService } from './folders.service.js'

describe('FoldersService', () => {
  it('delegates Folder operations to the Folder client methods', async () => {
    const createFolder = jest.fn().mockResolvedValue({})
    const findAllFolders = jest.fn().mockResolvedValue({})
    const findFolderByUid = jest.fn().mockResolvedValue({})
    const replaceFolder = jest.fn().mockResolvedValue({})
    const updateFolder = jest.fn().mockResolvedValue({})
    const removeFolder = jest.fn().mockResolvedValue({})
    const client = {
      createFolder,
      findAllFolders,
      findFolderByUid,
      replaceFolder,
      updateFolder,
      removeFolder
    } as unknown as MsJourneysClient
    const service = new FoldersService(client)

    await service.create({ name: 'Folder', parentUid: 'journey-1' })
    await service.findAll()
    await service.findByUid('folder-1')
    await service.replace('folder-1', { name: 'Replaced' })
    await service.update('folder-1', { name: 'Updated' })
    await service.remove('folder-1')

    expect(createFolder).toHaveBeenCalledWith({ name: 'Folder', parentUid: 'journey-1' })
    expect(findAllFolders).toHaveBeenCalled()
    expect(findFolderByUid).toHaveBeenCalledWith('folder-1')
    expect(replaceFolder).toHaveBeenCalledWith('folder-1', { name: 'Replaced' })
    expect(updateFolder).toHaveBeenCalledWith('folder-1', { name: 'Updated' })
    expect(removeFolder).toHaveBeenCalledWith('folder-1')
  })
})
