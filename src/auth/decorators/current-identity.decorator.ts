import { createParamDecorator, UnauthorizedException } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import type { AuthenticatedIdentity, AuthenticatedRequest } from '../types/authenticated-identity.js'

export const CurrentIdentity = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedIdentity => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    if (!request.user) {
      throw new UnauthorizedException('Authenticated identity is unavailable')
    }

    return request.user
  }
)
