import { RouterModule } from '@nestjs/core'
import { FoldersModule } from './modules/folders/folders.module.js'
import { JourneysResourceModule } from './modules/journeys/journeys.module.js'
import { TasksModule } from './modules/tasks/tasks.module.js'
import { UserRootModule } from './modules/user-root/user-root.module.js'

export const JourneysRoutes = RouterModule.register([
  {
    path: 'journeys',
    children: [
      { path: '', module: UserRootModule },
      { path: '', module: JourneysResourceModule },
      { path: '', module: FoldersModule },
      { path: '', module: TasksModule }
    ]
  }
])
