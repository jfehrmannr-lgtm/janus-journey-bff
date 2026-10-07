import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Res } from '@nestjs/common'
import type { Response } from 'express'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { TasksService } from '../services/tasks.service.js'
import { CreateTaskDto } from '../dto/create-task.dto.js'
import { UpdateTaskDto } from '../dto/update-task.dto.js'
import { TaskResponseDto } from '../dto/task-response.dto.js'
import type { DownstreamResponse } from '../../../types/ms-journeys.types.js'

@ApiBearerAuth('bearer')
@ApiTags('MS Journeys · Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create a Task resource' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Task payload.' })
  @ApiConflictResponse({ description: 'The Task violates a uniqueness constraint.' })
  @Post()
  async create(@Body() payload: CreateTaskDto, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.tasksService.create(payload))
  }

  @ApiOperation({ summary: 'List Task resources' })
  @ApiResponse({ isArray: true, status: 200, type: TaskResponseDto })
  @Get()
  async findAll(@Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.tasksService.findAll())
  }

  @ApiOperation({ summary: 'Get a Task resource by UID' })
  @ApiParam({ description: 'Domain UID of the Task resource.', name: 'uid', type: String })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  @ApiNotFoundResponse({ description: 'The Task resource was not found.' })
  @Get(':uid')
  async findByUid(@Param('uid') uid: string, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.tasksService.findByUid(uid))
  }

  @ApiOperation({ summary: 'Replace a Task resource by UID' })
  @ApiParam({ description: 'Domain UID of the Task resource.', name: 'uid', type: String })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  @ApiNotFoundResponse({ description: 'The Task resource was not found.' })
  @Put(':uid')
  async replace(
    @Param('uid') uid: string,
    @Body() payload: UpdateTaskDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.tasksService.replace(uid, payload))
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
