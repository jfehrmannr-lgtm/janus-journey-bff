import { Module } from '@nestjs/common'
import { UsersController } from './controllers/users.controller.js'
import { MsUsersClient } from './clients/ms-users.client.js'
import { UsersService } from './services/users.service.js'

@Module({
  controllers: [UsersController],
  exports: [MsUsersClient, UsersService],
  providers: [MsUsersClient, UsersService]
})
export class UsersModule {}
