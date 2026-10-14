import { describe, expect, it, jest } from '@jest/globals'
import { MsJourneysClient } from '@journeys/clients/ms-journeys.client.js'
import { JourneysService } from './journeys.service.js'
import { BadRequestException } from '@nestjs/common'

describe('JourneysService', () => {
  it('delegates Journey operations to the Journey client methods', async () => {
    const createJourney = jest.fn().mockResolvedValue({})
    const findAllJourneys = jest
      .fn()
      .mockResolvedValue({ status: 200, headers: {}, body: { items: [], totalRecords: 0 } })
    const findJourneyByUid = jest.fn().mockResolvedValue({})
    const updateJourney = jest.fn().mockResolvedValue({})
    const removeJourney = jest.fn().mockResolvedValue({})
    const client = {
      createJourney,
      findAllJourneys,
      findJourneyByUid,
      updateJourney,
      removeJourney
    } as unknown as MsJourneysClient
    const service = new JourneysService(client, {} as never, {} as never)

    await service.create({ name: 'Journey', parent: { type: 'journey', uid: 'journey-1' } }, { sub: 'user-1' })
    await service.findAll({ page: 1, size: 20 })
    await service.findByUid('journey-1')
    await service.update('journey-1', { name: 'Updated' })
    await service.remove('journey-1')

    expect(createJourney).toHaveBeenCalledWith({ name: 'Journey', parent: { type: 'journey', uid: 'journey-1' } })
    expect(findAllJourneys).toHaveBeenCalledWith({ page: 1, size: 20 })
    expect(findJourneyByUid).toHaveBeenCalledWith('journey-1')
    expect(updateJourney).toHaveBeenCalledWith('journey-1', { name: 'Updated' })
    expect(removeJourney).toHaveBeenCalledWith('journey-1')
  })

  it('creates a Journey, Folders, and one combined Task batch in order', async () => {
    const journeyResult = { status: 201, headers: {}, body: { uid: 'journey-1', name: 'Journey' } }
    const folderResult = {
      status: 201,
      headers: {},
      body: {
        items: [
          { clientId: 'folder-2', resource: { uid: 'folder-2-uid' } },
          { clientId: 'folder-1', resource: { uid: 'folder-1-uid' } }
        ]
      }
    }
    const createJourney = jest.fn().mockResolvedValue(journeyResult)
    const createFoldersBulk = jest.fn().mockResolvedValue(folderResult)
    const createTasksBulk = jest.fn().mockResolvedValue({ status: 201, headers: {}, body: { items: [] } })
    const service = new JourneysService(
      { createJourney } as unknown as MsJourneysClient,
      { createBulk: createFoldersBulk } as never,
      { createBulk: createTasksBulk } as never
    )

    const result = await service.compose(
      {
        name: 'Journey',
        folders: [
          {
            clientId: 'folder-1',
            name: 'Frontend',
            tasks: [{ isVisible: true, name: 'React', state: 'pending' }]
          },
          { clientId: 'folder-2', name: 'Backend' }
        ],
        tasks: [{ isVisible: true, name: 'Git', state: 'pending' }]
      },
      { sub: 'user-1' }
    )

    expect(result).toBe(journeyResult)
    expect(createJourney).toHaveBeenCalledWith({
      description: undefined,
      metadata: undefined,
      name: 'Journey',
      parent: { uid: 'user-1', type: 'user' }
    })
    expect(createFoldersBulk).toHaveBeenCalledWith(
      [
        {
          clientId: 'folder-1',
          name: 'Frontend',
          description: undefined,
          metadata: undefined,
          orderIndex: undefined,
          parent: { uid: 'journey-1', type: 'journey' }
        },
        {
          clientId: 'folder-2',
          name: 'Backend',
          description: undefined,
          metadata: undefined,
          orderIndex: undefined,
          parent: { uid: 'journey-1', type: 'journey' }
        }
      ],
      { sub: 'user-1' }
    )
    expect(createTasksBulk).toHaveBeenCalledWith(
      [
        { isVisible: true, name: 'Git', state: 'pending', parent: { uid: 'journey-1', type: 'journey' } },
        { isVisible: true, name: 'React', state: 'pending', parent: { uid: 'folder-1-uid', type: 'folder' } }
      ],
      { sub: 'user-1' }
    )
  })

  it('rejects duplicate Folder clientIds before creating the Journey', async () => {
    const createJourney = jest.fn()
    const service = new JourneysService({ createJourney } as unknown as MsJourneysClient, {} as never, {} as never)

    await expect(
      service.compose(
        {
          name: 'Journey',
          folders: [
            { clientId: 'duplicate', name: 'One' },
            { clientId: 'duplicate', name: 'Two' }
          ]
        },
        { sub: 'user-1' }
      )
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(createJourney).not.toHaveBeenCalled()
  })
})
