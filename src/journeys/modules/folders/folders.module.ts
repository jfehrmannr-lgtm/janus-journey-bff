import { Module } from '@nestjs/common'
import { MsJourneysClientModule } from '../../clients/ms-journeys-client.module.js'
import { FoldersController } from './controllers/folders.controller.js'
import { FoldersService } from './services/folders.service.js'

@Module({
  controllers: [FoldersController],
  imports: [MsJourneysClientModule],
  providers: [FoldersService]
})
export class FoldersModule {}
