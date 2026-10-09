import { Module } from '@nestjs/common'
import { MsJourneysClientModule } from './clients/ms-journeys-client.module.js'
import { FoldersModule } from './modules/folders/folders.module.js'
import { JourneysResourceModule } from './modules/journeys/journeys.module.js'
import { TasksModule } from './modules/tasks/tasks.module.js'
import { JourneysRoutes } from './journeys.routes.js'
import { UserRootModule } from './modules/user-root/user-root.module.js'

@Module({
  imports: [JourneysRoutes, UserRootModule, MsJourneysClientModule, JourneysResourceModule, FoldersModule, TasksModule]
})
export class JourneysModule {}
