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
import { FoldersService } from '../services/folders.service.js'
import { CreateFolderDto } from '../dto/create-folder.dto.js'
import { UpdateFolderDto } from '../dto/update-folder.dto.js'
import { FolderResponseDto } from '../dto/folder-response.dto.js'
import type { DownstreamResponse } from '../../../types/ms-journeys.types.js'

@ApiBearerAuth('bearer')
@ApiTags('MS Journeys · Folders')
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @ApiOperation({ summary: 'Create a Folder resource' })
  @ApiBody({ type: CreateFolderDto })
  @ApiResponse({ status: 201, type: FolderResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Folder payload.' })
  @ApiConflictResponse({ description: 'The Folder violates a uniqueness constraint.' })
  @Post()
  async create(@Body() payload: CreateFolderDto, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.foldersService.create(payload))
  }

  @ApiOperation({ summary: 'List Folder resources' })
  @ApiResponse({ isArray: true, status: 200, type: FolderResponseDto })
  @Get()
  async findAll(@Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.foldersService.findAll())
  }

  @ApiOperation({ summary: 'Get a Folder resource by UID' })
  @ApiParam({ description: 'Domain UID of the Folder resource.', name: 'uid', type: String })
  @ApiResponse({ status: 200, type: FolderResponseDto })
  @ApiNotFoundResponse({ description: 'The Folder resource was not found.' })
  @Get(':uid')
  async findByUid(@Param('uid') uid: string, @Res({ passthrough: true }) response: Response): Promise<unknown> {
    return this.writeResponse(response, await this.foldersService.findByUid(uid))
  }

  @ApiOperation({ summary: 'Replace a Folder resource by UID' })
  @ApiParam({ description: 'Domain UID of the Folder resource.', name: 'uid', type: String })
  @ApiBody({ type: UpdateFolderDto })
  @ApiResponse({ status: 200, type: FolderResponseDto })
  @ApiNotFoundResponse({ description: 'The Folder resource was not found.' })
  @Put(':uid')
  async replace(
    @Param('uid') uid: string,
    @Body() payload: UpdateFolderDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    return this.writeResponse(response, await this.foldersService.replace(uid, payload))
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
