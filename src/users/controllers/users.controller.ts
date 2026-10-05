import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentIdentity } from '../../auth/decorators/current-identity.decorator.js'
import type { AuthenticatedIdentity } from '../../auth/types/authenticated-identity.js'
import { UsersService } from '../services/users.service.js'
import type { DownstreamResponse, UserPayload } from '../types/ms-users.types.js'
import { forwardedParamsDescription, userPayloadSchema, userResponseSchema } from '../types/users-openapi.js'

type UserQuery = Record<string, string | string[] | undefined>

@ApiBearerAuth('bearer')
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    description: 'Creates a User resource by forwarding the opaque request body to ms-users.',
    summary: 'Create a User resource'
  })
  @ApiBody({
    description: 'Opaque User payload. User fields are intentionally not defined by the BFF yet.',
    required: true,
    schema: userPayloadSchema
  })
  @ApiResponse({ description: 'User resource created by ms-users.', schema: userResponseSchema, status: 201 })
  @ApiResponse({ description: 'Missing or invalid Better Auth JWT.', status: 401 })
  @ApiResponse({ description: 'The BFF could not obtain a valid response from ms-users.', status: 502 })
  @ApiResponse({ description: 'The ms-users request timed out.', status: 504 })
  @ApiResponse({ description: 'Unexpected internal BFF failure.', status: 500 })
  @Post()
  async create(
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Body() payload: UserPayload,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.usersService.create(identity, payload))
  }

  @ApiOperation({
    description: `Lists User resources through ms-users. ${forwardedParamsDescription}`,
    summary: 'List User resources'
  })
  @ApiResponse({
    description: 'User resources returned successfully by ms-users.',
    schema: userResponseSchema,
    status: 200
  })
  @ApiResponse({ description: 'Missing or invalid Better Auth JWT.', status: 401 })
  @ApiResponse({ description: 'The BFF could not obtain a valid response from ms-users.', status: 502 })
  @ApiResponse({ description: 'The ms-users request timed out.', status: 504 })
  @ApiResponse({ description: 'Unexpected internal BFF failure.', status: 500 })
  @Get()
  async findAll(
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Query() query: UserQuery,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.usersService.findAll(identity, { params: query }))
  }

  @ApiOperation({
    description: 'Gets one User resource by its resource identifier through ms-users.',
    summary: 'Get a User resource by ID'
  })
  @ApiParam({ description: 'Identifier of the User resource to retrieve.', name: 'id', required: true, type: String })
  @ApiResponse({
    description: 'The requested User resource was returned by ms-users.',
    schema: userResponseSchema,
    status: 200
  })
  @ApiResponse({ description: 'Missing or invalid Better Auth JWT.', status: 401 })
  @ApiResponse({ description: 'The User resource was not found by ms-users.', status: 404 })
  @ApiResponse({ description: 'The BFF could not obtain a valid response from ms-users.', status: 502 })
  @ApiResponse({ description: 'The ms-users request timed out.', status: 504 })
  @ApiResponse({ description: 'Unexpected internal BFF failure.', status: 500 })
  @Get(':id')
  async findById(
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Param('id') resourceId: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.usersService.findById(identity, resourceId))
  }

  @ApiOperation({
    description: 'Updates a User resource by forwarding the opaque request body to ms-users.',
    summary: 'Update a User resource by ID'
  })
  @ApiParam({ description: 'Identifier of the User resource to update.', name: 'id', required: true, type: String })
  @ApiBody({
    description: 'Opaque User payload. User fields are intentionally not defined by the BFF yet.',
    required: true,
    schema: userPayloadSchema
  })
  @ApiResponse({ description: 'The User resource was updated by ms-users.', schema: userResponseSchema, status: 200 })
  @ApiResponse({ description: 'The User resource was updated without a response body.', status: 204 })
  @ApiResponse({ description: 'Missing or invalid Better Auth JWT.', status: 401 })
  @ApiResponse({ description: 'The User resource was not found by ms-users.', status: 404 })
  @ApiResponse({ description: 'The BFF could not obtain a valid response from ms-users.', status: 502 })
  @ApiResponse({ description: 'The ms-users request timed out.', status: 504 })
  @ApiResponse({ description: 'Unexpected internal BFF failure.', status: 500 })
  @Patch(':id')
  async update(
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Param('id') resourceId: string,
    @Body() payload: UserPayload,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.usersService.update(identity, resourceId, payload))
  }

  @ApiOperation({
    description: 'Deletes a User resource by its resource identifier through ms-users.',
    summary: 'Delete a User resource by ID'
  })
  @ApiParam({ description: 'Identifier of the User resource to delete.', name: 'id', required: true, type: String })
  @ApiResponse({ description: 'The User resource was deleted by ms-users.', status: 204 })
  @ApiResponse({
    description: 'ms-users returned a successful deletion response with a body.',
    schema: userResponseSchema,
    status: 200
  })
  @ApiResponse({ description: 'Missing or invalid Better Auth JWT.', status: 401 })
  @ApiResponse({ description: 'The User resource was not found by ms-users.', status: 404 })
  @ApiResponse({ description: 'The BFF could not obtain a valid response from ms-users.', status: 502 })
  @ApiResponse({ description: 'The ms-users request timed out.', status: 504 })
  @ApiResponse({ description: 'Unexpected internal BFF failure.', status: 500 })
  @Delete(':id')
  async remove(
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Param('id') resourceId: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.usersService.remove(identity, resourceId))
  }

  private writeResponse(response: Response, result: DownstreamResponse): unknown {
    response.status(result.status)

    for (const [name, value] of Object.entries(result.headers)) {
      response.setHeader(name, value)
    }

    return result.body
  }
}
