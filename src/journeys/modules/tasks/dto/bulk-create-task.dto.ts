import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, Length } from 'class-validator'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'
import { TASK_STATES, type TaskState } from './create-task.dto.js'

export class BulkCreateTaskItemDto {
  @ApiPropertyOptional({
    description: 'Optional Task parent. When omitted, the authenticated User is used.',
    examples: [
      { uid: 'journey-123', type: 'journey' },
      { uid: 'folder-123', type: 'folder' }
    ],
    type: ParentReferenceDto
  })
  @IsOptional()
  parent?: ParentReferenceDto

  @ApiProperty({ example: 'Understand HTTP' })
  @IsString()
  @Length(1, 255)
  name!: string

  @ApiPropertyOptional({ example: 'Description for task', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiProperty({ enum: TASK_STATES })
  @IsIn(TASK_STATES)
  state!: TaskState

  @ApiProperty({ default: true })
  @IsBoolean()
  isVisible!: boolean

  @ApiPropertyOptional({ example: 100, type: Number })
  @IsOptional()
  orderIndex?: unknown

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>

  @ApiPropertyOptional({
    description: 'Optional client correlation value. It is not an ownership reference.',
    example: 'task-client-1'
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  clientId?: string
}

export type ResolvedBulkTaskItem = Omit<BulkCreateTaskItemDto, 'parent'> & {
  parent: ParentReferenceDto
}
