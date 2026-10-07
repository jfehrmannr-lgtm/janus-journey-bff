import { Injectable } from '@nestjs/common'
import { MsJourneysClient } from '../../../clients/ms-journeys.client.js'
import type { CreateJourneyDto } from '../dto/create-journey.dto.js'
import type { UpdateJourneyDto } from '../dto/update-journey.dto.js'
import type { DownstreamResponse } from '../../../types/ms-journeys.types.js'

@Injectable()
export class JourneysService {
  constructor(private readonly client: MsJourneysClient) {}

  create(payload: CreateJourneyDto): Promise<DownstreamResponse> {
    return this.client.createJourney(payload)
  }

  findAll(): Promise<DownstreamResponse> {
    return this.client.findAllJourneys()
  }

  findByUid(uid: string): Promise<DownstreamResponse> {
    return this.client.findJourneyByUid(uid)
  }

  replace(uid: string, payload: UpdateJourneyDto): Promise<DownstreamResponse> {
    return this.client.replaceJourney(uid, payload)
  }

  update(uid: string, payload: UpdateJourneyDto): Promise<DownstreamResponse> {
    return this.client.updateJourney(uid, payload)
  }

  remove(uid: string): Promise<DownstreamResponse> {
    return this.client.removeJourney(uid)
  }
}
