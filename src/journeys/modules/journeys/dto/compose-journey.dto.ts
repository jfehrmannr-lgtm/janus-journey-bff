import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsIn, IsObject, IsOptional, IsString, Length, ValidateNested } from 'class-validator'
import { TASK_STATES, type TaskState } from '../../tasks/dto/create-task.dto.js'

export class ComposeTaskDto {
  @ApiProperty({ example: 'Learn React' })
  @IsString()
  @Length(1, 255)
  name!: string

  @ApiPropertyOptional({ example: 'Build a React application.', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiProperty({ enum: TASK_STATES })
  @IsIn(TASK_STATES)
  state!: TaskState

  @ApiProperty({ default: true })
  @IsBoolean()
  isVisible!: boolean

  @ApiPropertyOptional({ example: 0, type: Number })
  @IsOptional()
  orderIndex?: unknown

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>

  @ApiPropertyOptional({ example: 'task-client-1' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  clientId?: string
}

export class ComposeFolderDto {
  @ApiProperty({ example: 'folder-1', description: 'Frontend-generated correlation ID.' })
  @IsString()
  @Length(1, 255)
  clientId!: string

  @ApiProperty({ example: 'Frontend' })
  @IsString()
  @Length(1, 255)
  name!: string

  @ApiPropertyOptional({ example: 'Frontend technologies', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiPropertyOptional({ example: 0, type: Number })
  @IsOptional()
  orderIndex?: unknown

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>

  @ApiPropertyOptional({ type: [ComposeTaskDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComposeTaskDto)
  tasks?: ComposeTaskDto[]
}

export class ComposeJourneyDto {
  @ApiProperty({ example: 'Full Stack Development' })
  @IsString()
  @Length(1, 255)
  name!: string

  @ApiPropertyOptional({ example: 'My learning journey', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>

  @ApiPropertyOptional({ type: [ComposeFolderDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComposeFolderDto)
  folders?: ComposeFolderDto[]

  @ApiPropertyOptional({ type: [ComposeTaskDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComposeTaskDto)
  tasks?: ComposeTaskDto[]
}
