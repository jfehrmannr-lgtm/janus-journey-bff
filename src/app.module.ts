import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HttpClientModule } from '@nestjs/http-client'
import { AuthModule } from './auth/auth.module.js'
import { validateEnvironment } from './config/configuration.js'
import { UsersModule } from './users/users.module.js'
import { JourneysModule } from './journeys/journeys.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateEnvironment
    }),
    HttpClientModule.register({ isGlobal: true }),
    AuthModule,
    UsersModule,
    JourneysModule
  ]
})
export class AppModule {}
