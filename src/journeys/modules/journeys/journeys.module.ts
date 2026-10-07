import { Module } from '@nestjs/common'
import { MsJourneysClientModule } from '../../clients/ms-journeys-client.module.js'
import { JourneysController } from './controllers/journeys.controller.js'
import { JourneysService } from './services/journeys.service.js'

@Module({
  controllers: [JourneysController],
  imports: [MsJourneysClientModule],
  providers: [JourneysService]
})
export class JourneysResourceModule {}
