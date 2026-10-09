import { Module } from '@nestjs/common'
import { MsJourneysClientModule } from '@journeys/clients/ms-journeys-client.module.js'
import { UserRootController } from './controllers/user-root.controller.js'
import { UserRootService } from './services/user-root.service.js'

@Module({
  controllers: [UserRootController],
  imports: [MsJourneysClientModule],
  providers: [UserRootService]
})
export class UserRootModule {}
