import { Module } from '@nestjs/common'
import { MsJourneysClientModule } from '@journeys/clients/ms-journeys-client.module.js'
import { JourneysController } from './controllers/journeys.controller.js'
import { JourneysService } from './services/journeys.service.js'
import { FoldersModule } from '../folders/folders.module.js'
import { TasksModule } from '../tasks/tasks.module.js'

@Module({
  controllers: [JourneysController],
  imports: [MsJourneysClientModule, FoldersModule, TasksModule],
  providers: [JourneysService]
})
export class JourneysResourceModule {}
