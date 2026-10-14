import { Body, Controller, Delete, Get, HttpCode, Param, ParseArrayPipe, Patch, Post, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { TasksService } from '../services/tasks.service.js'
import { CreateTaskDto } from '../dto/create-task.dto.js'
import { UpdateTaskDto } from '../dto/update-task.dto.js'
import { TaskResponseDto } from '../dto/task-response.dto.js'
import { TasksCollectionResponseDto } from '../dto/tasks-collection-response.dto.js'
import type { DownstreamResponse } from '@journeys/types/ms-journeys.types.js'
import { PaginationQueryDto } from '@common/collections/pagination-query.dto.js'
import { BulkCreateTaskItemDto } from '../dto/bulk-create-task.dto.js'
import { CurrentIdentity } from '@auth/decorators/current-identity.decorator.js'
import type { AuthenticatedIdentity } from '@auth/types/authenticated-identity.js'

@ApiBearerAuth('bearer')
@ApiTags('MS Journeys · Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create a Task resource' })
  @ApiBody({
    description: 'Optional parent. Omitted or empty parents resolve to the authenticated User.',
    type: CreateTaskDto
  })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid Task payload, malformed parent, or an explicit User parent was provided.'
  })
  @ApiConflictResponse({ description: 'The Task violates a uniqueness constraint.' })
  @Post()
  async create(
    @Body() payload: CreateTaskDto,
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.tasksService.create(payload, identity))
  }

  @ApiOperation({ summary: 'Bulk create Task resources' })
  @ApiBody({
    description: 'Direct array of Task items. Omitted parents resolve to the authenticated User.',
    isArray: true,
    type: BulkCreateTaskItemDto
  })
  @ApiResponse({ status: 201, description: 'Task resources created successfully.' })
  @ApiBadRequestResponse({
    description: 'Invalid Task payload, malformed parent, or an explicit User parent was provided.'
  })
  @ApiConflictResponse({ description: 'A Task violates a uniqueness constraint.' })
  @Post('bulk')
  async createBulk(
    @Body(new ParseArrayPipe({ items: BulkCreateTaskItemDto })) payload: BulkCreateTaskItemDto[],
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.tasksService.createBulk(payload, identity))
  }

  @ApiOperation({ summary: 'List Task resources' })
  @ApiQuery({
    name: 'page',
    required: true,
    type: 'integer',
    minimum: 1,
    description: 'Requested collection page.',
    example: 1
  })
  @ApiQuery({
    name: 'size',
    required: true,
    type: 'integer',
    minimum: 1,
    description: 'Requested page size. Values above 200 are normalized to 200.',
    example: 20
  })
  @ApiResponse({
    description: 'Task collection returned successfully.',
    status: 200,
    type: TasksCollectionResponseDto
  })
  @Get()
  async findAll(@Query() query: PaginationQueryDto, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.tasksService.findAll(query))
  }

  @ApiOperation({ summary: 'Get a Task resource by UID' })
  @ApiParam({ description: 'Domain UID of the Task resource.', name: 'uid', type: String })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  @ApiNotFoundResponse({ description: 'The Task resource was not found.' })
  @Get(':uid')
  async findByUid(@Param('uid') uid: string, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.tasksService.findByUid(uid))
  }

  @ApiOperation({ summary: 'Partially update a Task resource by UID' })
  @ApiParam({ description: 'Domain UID of the Task resource.', name: 'uid', type: String })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  @ApiNotFoundResponse({ description: 'The Task resource was not found.' })
  @Patch(':uid')
  async update(
    @Param('uid') uid: string,
    @Body() payload: UpdateTaskDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.tasksService.update(uid, payload))
  }

  @ApiOperation({ summary: 'Delete a Task resource by UID' })
  @ApiParam({ description: 'Domain UID of the Task resource.', name: 'uid', type: String })
  @ApiResponse({ description: 'The Task resource was deleted.', status: 204 })
  @ApiNotFoundResponse({ description: 'The Task resource was not found.' })
  @Delete(':uid')
  @HttpCode(204)
  async remove(@Param('uid') uid: string, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.tasksService.remove(uid))
  }

  private writeResponse(response: Response, result: DownstreamResponse): unknown {
    response.status(result.status)

    for (const [name, value] of Object.entries(result.headers)) {
      response.setHeader(name, value)
    }

    return result.body
  }
}
