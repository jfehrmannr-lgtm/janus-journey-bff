import { describe, expect, it, jest } from '@jest/globals'
import { MsJourneysClient } from '../../../clients/ms-journeys.client.js'
import { JourneysService } from './journeys.service.js'

describe('JourneysService', () => {
  it('delegates Journey operations to the Journey client methods', async () => {
    const createJourney = jest.fn().mockResolvedValue({})
    const findAllJourneys = jest.fn().mockResolvedValue({})
    const findJourneyByUid = jest.fn().mockResolvedValue({})
    const replaceJourney = jest.fn().mockResolvedValue({})
    const updateJourney = jest.fn().mockResolvedValue({})
    const removeJourney = jest.fn().mockResolvedValue({})
    const client = {
      createJourney,
      findAllJourneys,
      findJourneyByUid,
      replaceJourney,
      updateJourney,
      removeJourney
    } as unknown as MsJourneysClient
    const service = new JourneysService(client)

    await service.create({ name: 'Journey', parentUid: 'user-1' })
    await service.findAll()
    await service.findByUid('journey-1')
    await service.replace('journey-1', { name: 'Replaced' })
    await service.update('journey-1', { name: 'Updated' })
    await service.remove('journey-1')

    expect(createJourney).toHaveBeenCalledWith({ name: 'Journey', parentUid: 'user-1' })
    expect(findAllJourneys).toHaveBeenCalled()
    expect(findJourneyByUid).toHaveBeenCalledWith('journey-1')
    expect(replaceJourney).toHaveBeenCalledWith('journey-1', { name: 'Replaced' })
    expect(updateJourney).toHaveBeenCalledWith('journey-1', { name: 'Updated' })
    expect(removeJourney).toHaveBeenCalledWith('journey-1')
  })
})
