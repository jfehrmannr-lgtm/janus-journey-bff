import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
  Res
} from '@nestjs/common'
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
import {
  TasksCollectionResponseDto,
  TasksPayloadCollectionResponseDto,
  TasksPayloadResponseDto
} from '../dto/tasks-collection-response.dto.js'
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
  @ApiResponse({ status: 201, type: TasksPayloadResponseDto })
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
    const result = await this.tasksService.create(payload, identity)
    const body = this.isSuccessful(result.status) ? { payload: result.body } : undefined
    return this.writeResponse(response, result, body)
  }

  @ApiOperation({ summary: 'Bulk create Task resources' })
  @ApiBody({
    description: 'Direct array of Task items. Omitted parents resolve to the authenticated User.',
    isArray: true,
    type: BulkCreateTaskItemDto
  })
  @ApiResponse({ status: 201, type: TasksPayloadCollectionResponseDto })
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
    const result = await this.tasksService.createBulk(payload, identity)
    return this.writeResponse(response, result, this.getBulkPayload(result))
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

  private writeResponse(response: Response, result: DownstreamResponse, body?: unknown): unknown {
    response.status(result.status)

    for (const [name, value] of Object.entries(result.headers)) {
      response.setHeader(name, value)
    }

    return body ?? result.body
  }

  private getBulkPayload(result: DownstreamResponse): unknown {
    if (!this.isSuccessful(result.status)) return undefined
    if (!isBulkResponse(result.body)) throw new BadGatewayException('The ms-journeys bulk Task response was invalid')
    if (!result.body.items.every(isCreatedResource)) {
      throw new BadGatewayException('The ms-journeys bulk Task response did not include created resources')
    }

    return { payload: result.body.items.map((item) => item.resource) }
  }

  private isSuccessful(status: number): boolean {
    return status >= 200 && status < 300
  }
}

const isBulkResponse = (body: unknown): body is { items: unknown[] } => {
  return typeof body === 'object' && body !== null && 'items' in body && Array.isArray(body.items)
}

const isCreatedResource = (item: unknown): item is { resource: unknown } => {
  return typeof item === 'object' && item !== null && 'resource' in item
}
