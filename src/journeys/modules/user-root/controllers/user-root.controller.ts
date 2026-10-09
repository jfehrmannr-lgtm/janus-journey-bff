import { Controller, Get, Res } from '@nestjs/common'
import type { Response } from 'express'
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiGatewayTimeoutResponse,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { CurrentIdentity } from '@auth/decorators/current-identity.decorator.js'
import type { AuthenticatedIdentity } from '@auth/types/authenticated-identity.js'
import type { DownstreamResponse } from '@journeys/types/ms-journeys.types.js'
import { UserRootResponseDto } from '../dto/user-root-response.dto.js'
import { UserRootService } from '../services/user-root.service.js'

@ApiBearerAuth('bearer')
@ApiTags('MS Journeys · User Root Resources')
@Controller()
export class UserRootController {
  constructor(private readonly userRootService: UserRootService) {}

  @ApiOperation({
    description: 'Returns the authenticated User resources directly owned by its User parent reference.',
    summary: 'List authenticated User root resources'
  })
  @ApiResponse({
    description: 'The authenticated User root resources returned by ms-journeys.',
    status: 200,
    type: UserRootResponseDto
  })
  @ApiBadGatewayResponse({ description: 'The BFF could not obtain a valid response from ms-journeys.' })
  @ApiGatewayTimeoutResponse({ description: 'The ms-journeys request timed out.' })
  @Get('root')
  async findRoot(
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.userRootService.findRoot(identity))
  }

  private writeResponse(response: Response, result: DownstreamResponse): unknown {
    response.status(result.status)

    for (const [name, value] of Object.entries(result.headers)) {
      response.setHeader(name, value)
    }

    return result.body
  }
}
