import { Injectable } from '@nestjs/common'
import type { AuthenticatedIdentity } from '@auth/types/authenticated-identity.js'
import { MsJourneysClient } from '@journeys/clients/ms-journeys.client.js'
import type { DownstreamResponse } from '@journeys/types/ms-journeys.types.js'
import type { ResourceType } from '../dto/resource-params.dto.js'
import type {
  ResourceResponseDto,
  UserRootItemsResponseDto,
  UserRootResponseDto
} from '../dto/user-root-response.dto.js'

interface UserRootDownstreamResponse {
  readonly items: UserRootItemsResponseDto
  readonly registers: number
}

interface ResourceDownstreamResponse {
  readonly items: ResourceResponseDto['payload']
}

@Injectable()
export class UserRootService {
  constructor(private readonly client: MsJourneysClient) {}

  async findRoot(identity: AuthenticatedIdentity): Promise<DownstreamResponse<UserRootResponseDto>> {
    const result = await this.client.findUserRoot(identity.sub)

    if (result.status < 200 || result.status >= 300) {
      return result as DownstreamResponse<UserRootResponseDto>
    }

    const body = result.body as UserRootDownstreamResponse

    return {
      ...result,
      body: {
        payload: body.items,
        registers: body.registers
      }
    }
  }

  async findResource(resourceType: ResourceType, resourceId: string): Promise<DownstreamResponse<ResourceResponseDto>> {
    const result = await this.client.findResource(resourceType, resourceId)

    if (result.status < 200 || result.status >= 300) {
      return result as DownstreamResponse<ResourceResponseDto>
    }

    const body = result.body as ResourceDownstreamResponse

    return {
      ...result,
      body: { payload: body.items }
    }
  }
}
