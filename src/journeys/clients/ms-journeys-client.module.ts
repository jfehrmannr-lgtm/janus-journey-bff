import { Module } from '@nestjs/common'
import { MsJourneysClient } from './ms-journeys.client.js'

@Module({
  exports: [MsJourneysClient],
  providers: [MsJourneysClient]
})
export class MsJourneysClientModule {}
