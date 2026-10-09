import { Controller, Get, Param, Res } from '@nestjs/common'
import type { Response } from 'express'
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiGatewayTimeoutResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { CurrentIdentity } from '@auth/decorators/current-identity.decorator.js'
import type { AuthenticatedIdentity } from '@auth/types/authenticated-identity.js'
import type { DownstreamResponse } from '@journeys/types/ms-journeys.types.js'
import { ResourceParamsDto } from '../dto/resource-params.dto.js'
import {
  FolderResourceResponseDto,
  JourneyResourceResponseDto,
  ResourceResponseDto,
  UserRootResponseDto
} from '../dto/user-root-response.dto.js'
import { UserRootService } from '../services/user-root.service.js'

@ApiBearerAuth('bearer')
@ApiTags('MS Journeys · User Root Resources')
@ApiExtraModels(FolderResourceResponseDto, JourneyResourceResponseDto, ResourceResponseDto)
@Controller()
export class UserRootController {
  constructor(private readonly userRootService: UserRootService) {}

  @ApiOperation({
    description:
      'Returns a complete Journey with nested Folders and Tasks, a Folder with direct Tasks, or a complete Task.',
    summary: 'Get an authenticated resource by type and ID'
  })
  @ApiParam({
    description: 'Resource type to retrieve.',
    enum: ['journey', 'folder', 'task'],
    name: 'resourceType',
    required: true
  })
  @ApiParam({ description: 'Domain UID of the resource.', name: 'resourceId', type: String })
  @ApiResponse({
    description: 'The complete resource returned by ms-journeys.',
    status: 200,
    type: ResourceResponseDto
  })
  @ApiBadGatewayResponse({ description: 'The BFF could not obtain a valid response from ms-journeys.' })
  @ApiGatewayTimeoutResponse({ description: 'The ms-journeys request timed out.' })
  @Get('resources/:resourceType/:resourceId')
  async findResource(
    @CurrentIdentity() _identity: AuthenticatedIdentity,
    @Param() params: ResourceParamsDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.userRootService.findResource(params.resourceType, params.resourceId))
  }

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
