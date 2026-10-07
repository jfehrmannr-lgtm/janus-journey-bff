import type { AuthenticatedIdentity } from '@auth/types/authenticated-identity.js'
import type { CollectionResult } from '@common/collections/collection.types.js'
import type { User } from './user.types.js'

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

export type MsUsersCollectionResult = CollectionResult<User>

export interface UserFilters {
  readonly email?: string
  readonly isVerified?: boolean
  readonly username?: string
  readonly userId?: string
  readonly sortBy: 'createdAt' | 'updatedAt' | 'userId' | 'email'
  readonly sortOrder: 'asc' | 'desc'
}
