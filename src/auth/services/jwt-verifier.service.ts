import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import { JWT_AUDIENCE } from '../../config/configuration.js'
import type { AuthenticatedIdentity } from '../types/authenticated-identity.js'

interface BetterAuthJwtPayload extends JWTPayload {
  sub: string
}

@Injectable()
export class JwtVerifierService {
  private readonly issuer: string
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>

  constructor(config: ConfigService) {
    this.issuer = config.getOrThrow<string>('BETTER_AUTH_ISSUER')
    this.jwks = createRemoteJWKSet(new URL(config.getOrThrow<string>('BETTER_AUTH_JWKS_URL')))
  }

  async verify(token: string): Promise<AuthenticatedIdentity> {
    try {
      const { payload } = await jwtVerify<BetterAuthJwtPayload>(token, this.jwks, {
        audience: JWT_AUDIENCE,
        issuer: this.issuer,
        requiredClaims: ['exp', 'iss', 'aud', 'sub']
      })

      if (payload.sub.trim() === '') {
        throw new UnauthorizedException('JWT subject is required')
      }

      return { sub: payload.sub }
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error
      }

      throw new UnauthorizedException('JWT validation failed')
    }
  }
}
