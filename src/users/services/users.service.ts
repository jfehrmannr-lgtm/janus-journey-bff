import { Injectable } from '@nestjs/common'
import type { AuthenticatedIdentity } from '@auth/types/authenticated-identity.js'
import { MsUsersClient } from '../clients/ms-users.client.js'
import type { CreateUserDto } from '../dto/create-user.dto.js'
import type { FindUsersQueryDto } from '../dto/find-users-query.dto.js'
import type { UpdateUserDto } from '../dto/update-user.dto.js'
import type { DownstreamResponse, UserFilters, UserPayload } from '../types/ms-users.types.js'
import type { CollectionResponse } from '@common/collections/collection.types.js'
import { buildCollectionResponse } from '@common/collections/collection.builder.js'
import { effectivePageSize } from '@common/collections/pagination-query.dto.js'
import { parseCollectionResult } from '@common/collections/collection.parser.js'

@Injectable()
export class UsersService {
  constructor(private readonly client: MsUsersClient) {}

  create(identity: AuthenticatedIdentity, payload: CreateUserDto): Promise<DownstreamResponse> {
    const internalPayload: UserPayload = { ...payload, id: identity.sub }

    return this.client.create(internalPayload, identity)
  }

  async findAll(
    identity: AuthenticatedIdentity,
    query: FindUsersQueryDto
  ): Promise<DownstreamResponse<CollectionResponse<unknown, UserFilters>>> {
    const page = Number(query.page)
    const size = effectivePageSize(Number(query.size))
    const sortBy = query.sortBy ?? 'createdAt'
    const sortOrder = query.sortOrder ?? 'asc'
    const result = await this.client.findAll(identity, {
      email: query.email,
      isVerified: query.isVerified,
      page,
      size,
      sortBy,
      sortOrder,
      userId: query.userId,
      username: query.username
    })

    if (result.status < 200 || result.status >= 300)
      return result as DownstreamResponse<CollectionResponse<unknown, UserFilters>>

    const collection = parseCollectionResult(result.body)
    return {
      ...result,
      body: buildCollectionResponse<unknown, UserFilters>(
        collection.items,
        collection.totalRecords,
        page,
        size,
        Object.fromEntries(
          Object.entries({
            email: query.email,
            isVerified: query.isVerified,
            username: query.username,
            userId: query.userId,
            sortBy,
            sortOrder
          }).filter(([, value]) => value !== undefined)
        ) as unknown as UserFilters
      )
    }
  }

  findById(identity: AuthenticatedIdentity, resourceId: string): Promise<DownstreamResponse> {
    return this.client.findById(resourceId, identity)
  }

  update(identity: AuthenticatedIdentity, resourceId: string, payload: UpdateUserDto): Promise<DownstreamResponse> {
    return this.client.update(resourceId, payload, identity)
  }

  remove(identity: AuthenticatedIdentity, resourceId: string): Promise<DownstreamResponse> {
    return this.client.remove(resourceId, identity)
  }
}
