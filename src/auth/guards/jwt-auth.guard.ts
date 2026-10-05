import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js'
import type { AuthenticatedRequest } from '../types/authenticated-identity.js'
import { JwtVerifierService } from '../services/jwt-verifier.service.js'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verifier: JwtVerifierService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const authorization = request.headers.authorization
    const token = this.extractBearerToken(authorization)

    if (!token) {
      throw new UnauthorizedException('Bearer token is required')
    }

    try {
      request.user = await this.verifier.verify(token)
      return true
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error
      }

      throw new UnauthorizedException('Invalid bearer token')
    }
  }

  private extractBearerToken(authorization: string | undefined): string | undefined {
    if (!authorization) {
      return undefined
    }

    const [scheme, token] = authorization.split(' ')

    if (scheme?.toLowerCase() !== 'bearer' || !token || authorization.split(' ').length !== 2) {
      return undefined
    }

    return token
  }
}
