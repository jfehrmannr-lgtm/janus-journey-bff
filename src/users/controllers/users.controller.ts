import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentIdentity } from '@auth/decorators/current-identity.decorator.js'
import type { AuthenticatedIdentity } from '@auth/types/authenticated-identity.js'
import { CreateUserDto } from '../dto/create-user.dto.js'
import { FindUsersQueryDto } from '../dto/find-users-query.dto.js'
import { UserResponseDto } from '../dto/user-response.dto.js'
import { UpdateUserDto } from '../dto/update-user.dto.js'
import { UsersCollectionResponseDto } from '../dto/users-collection-response.dto.js'
import { UsersService } from '../services/users.service.js'
import type { DownstreamResponse } from '../types/ms-users.types.js'
import { userPayloadSchema, userResponseSchema } from '../types/users-openapi.js'

@ApiBearerAuth('bearer')
@ApiTags('MS Users · Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    description:
      'Creates a User resource through ms-users using the validated Better Auth subject as its internal identity.',
    summary: 'Create a User resource'
  })
  @ApiBody({
    description:
      'User provisioning data. The internal User id is derived from the validated JWT and is not accepted from the client.',
    required: true,
    type: CreateUserDto
  })
  @ApiResponse({ description: 'User resource created by ms-users.', schema: userResponseSchema, status: 201 })
  @ApiResponse({ description: 'The User violates a uniqueness constraint.', status: 409 })
  @ApiResponse({ description: 'Missing or invalid Better Auth JWT.', status: 401 })
  @ApiResponse({ description: 'The BFF could not obtain a valid response from ms-users.', status: 502 })
  @ApiResponse({ description: 'The ms-users request timed out.', status: 504 })
  @ApiResponse({ description: 'Unexpected internal BFF failure.', status: 500 })
  @Post()
  async create(
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Body() payload: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.usersService.create(identity, payload))
  }

  @ApiOperation({
    description: 'Lists User resources using the validated pagination, filter, and sorting parameters.',
    summary: 'List User resources'
  })
  @ApiResponse({
    description: 'User resources returned successfully by ms-users.',
    type: UsersCollectionResponseDto,
    status: 200
  })
  @ApiResponse({ description: 'Missing or invalid Better Auth JWT.', status: 401 })
  @ApiResponse({ description: 'The BFF could not obtain a valid response from ms-users.', status: 502 })
  @ApiResponse({ description: 'The ms-users request timed out.', status: 504 })
  @ApiResponse({ description: 'Unexpected internal BFF failure.', status: 500 })
  @Get()
  async findAll(
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Query() query: FindUsersQueryDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.usersService.findAll(identity, query))
  }

  @ApiOperation({
    description: 'Gets one User resource by its resource identifier through ms-users.',
    summary: 'Get a User resource by ID'
  })
  @ApiParam({ description: 'Identifier of the User resource to retrieve.', name: 'id', required: true, type: String })
  @ApiResponse({
    description: 'The requested User resource was returned by ms-users.',
    type: UserResponseDto,
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
    description: 'Updates the editable configuration fields of a User resource through ms-users.',
    summary: 'Update a User resource by ID'
  })
  @ApiParam({ description: 'Identifier of the User resource to update.', name: 'id', required: true, type: String })
  @ApiBody({
    description: 'User update data. Only config.username and config.avatarUrl are editable.',
    required: true,
    schema: userPayloadSchema
  })
  @ApiResponse({ description: 'The User resource was updated by ms-users.', status: 200, type: UserResponseDto })
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
    @Body() payload: UpdateUserDto,
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
