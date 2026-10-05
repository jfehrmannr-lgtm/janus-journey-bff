import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './guards/jwt-auth.guard.js'
import { JwtVerifierService } from './services/jwt-verifier.service.js'

@Module({
  exports: [JwtAuthGuard, JwtVerifierService],
  providers: [
    JwtVerifierService,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard
    }
  ]
})
export class AuthModule {}
