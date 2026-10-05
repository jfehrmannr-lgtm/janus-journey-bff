import type { Request } from 'express'

export interface AuthenticatedIdentity {
  readonly sub: string
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedIdentity
}
