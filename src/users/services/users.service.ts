import { Injectable } from '@nestjs/common'
import type { AuthenticatedIdentity } from '../../auth/types/authenticated-identity.js'
import { MsUsersClient } from '../clients/ms-users.client.js'
import type { CreateUserDto } from '../dto/create-user.dto.js'
import type { DownstreamResponse, MsUsersRequestOptions, UserPayload } from '../types/ms-users.types.js'

@Injectable()
export class UsersService {
  constructor(private readonly client: MsUsersClient) {}

  create(identity: AuthenticatedIdentity, payload: CreateUserDto): Promise<DownstreamResponse> {
    const internalPayload: UserPayload = { ...payload, id: identity.sub }

    return this.client.create(internalPayload, identity)
  }

  findAll(identity: AuthenticatedIdentity, options: MsUsersRequestOptions = {}): Promise<DownstreamResponse> {
    return this.client.findAll(identity, options)
  }

  findById(identity: AuthenticatedIdentity, resourceId: string): Promise<DownstreamResponse> {
    return this.client.findById(resourceId, identity)
  }

  update(identity: AuthenticatedIdentity, resourceId: string, payload: UserPayload): Promise<DownstreamResponse> {
    return this.client.update(resourceId, payload, identity)
  }

  remove(identity: AuthenticatedIdentity, resourceId: string): Promise<DownstreamResponse> {
    return this.client.remove(resourceId, identity)
  }
}
