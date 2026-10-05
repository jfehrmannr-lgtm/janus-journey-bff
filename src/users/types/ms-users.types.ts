import type { AuthenticatedIdentity } from '../../auth/types/authenticated-identity.js'

export interface MsUsersRequestOptions {
  readonly params?: Readonly<Record<string, unknown>>
}

export interface AuthenticatedMsUsersRequest extends MsUsersRequestOptions {
  readonly authenticatedIdentity: AuthenticatedIdentity
}

export interface DownstreamResponse<TBody = unknown> {
  readonly status: number
  readonly body: TBody
  readonly headers: Readonly<Record<string, string>>
}

export type UserPayload = Record<string, unknown>
