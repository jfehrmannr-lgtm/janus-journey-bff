import { Body, Controller, Delete, Get, HttpCode, Param, ParseArrayPipe, Patch, Post, Query, Res } from '@nestjs/common'
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
import { FoldersService } from '../services/folders.service.js'
import { CreateFolderDto } from '../dto/create-folder.dto.js'
import { UpdateFolderDto } from '../dto/update-folder.dto.js'
import { FolderResponseDto } from '../dto/folder-response.dto.js'
import { FoldersCollectionResponseDto } from '../dto/folders-collection-response.dto.js'
import type { DownstreamResponse } from '@journeys/types/ms-journeys.types.js'
import { PaginationQueryDto } from '@common/collections/pagination-query.dto.js'
import { BulkCreateFolderItemDto } from '../dto/bulk-create-folder.dto.js'
import { CurrentIdentity } from '@auth/decorators/current-identity.decorator.js'
import type { AuthenticatedIdentity } from '@auth/types/authenticated-identity.js'

@ApiBearerAuth('bearer')
@ApiTags('MS Journeys · Folders')
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @ApiOperation({ summary: 'Create a Folder resource' })
  @ApiBody({
    description: 'Optional parent. Omitted or empty parents resolve to the authenticated User.',
    type: CreateFolderDto
  })
  @ApiResponse({ status: 201, type: FolderResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid Folder payload, malformed parent, or an explicit User parent was provided.'
  })
  @ApiConflictResponse({ description: 'The Folder violates a uniqueness constraint.' })
  @Post()
  async create(
    @Body() payload: CreateFolderDto,
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.foldersService.create(payload, identity))
  }

  @ApiOperation({ summary: 'Bulk create Folder resources' })
  @ApiBody({
    description: 'Direct array of Folder items. Omitted parents resolve to the authenticated User.',
    isArray: true,
    type: BulkCreateFolderItemDto
  })
  @ApiResponse({ status: 201, description: 'Folder resources created successfully.' })
  @ApiBadRequestResponse({
    description: 'Invalid Folder payload, malformed parent, or an explicit User parent was provided.'
  })
  @ApiConflictResponse({ description: 'A Folder violates a uniqueness constraint.' })
  @Post('bulk')
  async createBulk(
    @Body(new ParseArrayPipe({ items: BulkCreateFolderItemDto })) payload: BulkCreateFolderItemDto[],
    @CurrentIdentity() identity: AuthenticatedIdentity,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.foldersService.createBulk(payload, identity))
  }

  @ApiOperation({ summary: 'List Folder resources' })
  @ApiResponse({
    description: 'Folder collection returned successfully.',
    status: 200,
    type: FoldersCollectionResponseDto
  })
  @Get()
  async findAll(@Query() query: PaginationQueryDto, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.foldersService.findAll(query))
  }

  @ApiOperation({ summary: 'Get a Folder resource by UID' })
  @ApiParam({ description: 'Domain UID of the Folder resource.', name: 'uid', type: String })
  @ApiResponse({ status: 200, type: FolderResponseDto })
  @ApiNotFoundResponse({ description: 'The Folder resource was not found.' })
  @Get(':uid')
  async findByUid(@Param('uid') uid: string, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.foldersService.findByUid(uid))
  }

  @ApiOperation({ summary: 'Partially update a Folder resource by UID' })
  @ApiParam({ description: 'Domain UID of the Folder resource.', name: 'uid', type: String })
  @ApiBody({ type: UpdateFolderDto })
  @ApiResponse({ status: 200, type: FolderResponseDto })
  @ApiNotFoundResponse({ description: 'The Folder resource was not found.' })
  @Patch(':uid')
  async update(
    @Param('uid') uid: string,
    @Body() payload: UpdateFolderDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.foldersService.update(uid, payload))
  }

  @ApiOperation({ summary: 'Delete a Folder resource by UID' })
  @ApiParam({ description: 'Domain UID of the Folder resource.', name: 'uid', type: String })
  @ApiResponse({ description: 'The Folder resource was deleted.', status: 204 })
  @ApiNotFoundResponse({ description: 'The Folder resource was not found.' })
  @Delete(':uid')
  @HttpCode(204)
  async remove(@Param('uid') uid: string, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.foldersService.remove(uid))
  }

  private writeResponse(response: Response, result: DownstreamResponse): unknown {
    response.status(result.status)

    for (const [name, value] of Object.entries(result.headers)) {
      response.setHeader(name, value)
    }

    return result.body
  }
}
