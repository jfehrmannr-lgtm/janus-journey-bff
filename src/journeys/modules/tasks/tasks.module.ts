import { Module } from '@nestjs/common'
import { MsJourneysClientModule } from '../../clients/ms-journeys-client.module.js'
import { TasksController } from './controllers/tasks.controller.js'
import { TasksService } from './services/tasks.service.js'

@Module({
  controllers: [TasksController],
  imports: [MsJourneysClientModule],
  providers: [TasksService]
})
export class TasksModule {}
