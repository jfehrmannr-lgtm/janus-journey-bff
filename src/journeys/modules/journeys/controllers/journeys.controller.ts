import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Res } from '@nestjs/common'
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
import { JourneysService } from '../services/journeys.service.js'
import { CreateJourneyDto } from '../dto/create-journey.dto.js'
import { UpdateJourneyDto } from '../dto/update-journey.dto.js'
import { JourneyResponseDto } from '../dto/journey-response.dto.js'
import { JourneysCollectionResponseDto } from '../dto/journeys-collection-response.dto.js'
import type { DownstreamResponse } from '@journeys/types/ms-journeys.types.js'
import { PaginationQueryDto } from '@common/collections/pagination-query.dto.js'

@ApiBearerAuth('bearer')
@ApiTags('MS Journeys · Journeys')
@Controller('journeys')
export class JourneysController {
  constructor(private readonly journeysService: JourneysService) {}

  @ApiOperation({ summary: 'Create a Journey resource' })
  @ApiBody({ type: CreateJourneyDto })
  @ApiResponse({ status: 201, type: JourneyResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Journey payload.' })
  @ApiConflictResponse({ description: 'The Journey violates a uniqueness constraint.' })
  @Post()
  async create(@Body() payload: CreateJourneyDto, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.journeysService.create(payload))
  }

  @ApiOperation({ summary: 'List Journey resources' })
  @ApiResponse({
    description: 'Journey collection returned successfully.',
    status: 200,
    type: JourneysCollectionResponseDto
  })
  @Get()
  async findAll(@Query() query: PaginationQueryDto, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.journeysService.findAll(query))
  }

  @ApiOperation({ summary: 'Get a Journey resource by UID' })
  @ApiParam({ description: 'Domain UID of the Journey resource.', name: 'uid', type: String })
  @ApiResponse({ status: 200, type: JourneyResponseDto })
  @ApiNotFoundResponse({ description: 'The Journey resource was not found.' })
  @Get(':uid')
  async findByUid(@Param('uid') uid: string, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.journeysService.findByUid(uid))
  }

  @ApiOperation({ summary: 'Partially update a Journey resource by UID' })
  @ApiParam({ description: 'Domain UID of the Journey resource.', name: 'uid', type: String })
  @ApiBody({ type: UpdateJourneyDto })
  @ApiResponse({ status: 200, type: JourneyResponseDto })
  @ApiNotFoundResponse({ description: 'The Journey resource was not found.' })
  @Patch(':uid')
  async update(
    @Param('uid') uid: string,
    @Body() payload: UpdateJourneyDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.journeysService.update(uid, payload))
  }

  @ApiOperation({ summary: 'Delete a Journey resource by UID' })
  @ApiParam({ description: 'Domain UID of the Journey resource.', name: 'uid', type: String })
  @ApiResponse({ description: 'The Journey resource was deleted.', status: 204 })
  @ApiNotFoundResponse({ description: 'The Journey resource was not found.' })
  @Delete(':uid')
  @HttpCode(204)
  async remove(@Param('uid') uid: string, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.journeysService.remove(uid))
  }

  private writeResponse(response: Response, result: DownstreamResponse): unknown {
    response.status(result.status)

    for (const [name, value] of Object.entries(result.headers)) {
      response.setHeader(name, value)
    }

    return result.body
  }
}
