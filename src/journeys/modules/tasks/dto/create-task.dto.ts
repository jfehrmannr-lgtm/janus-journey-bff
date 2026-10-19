import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, Length } from 'class-validator'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'

export const TASK_STATES = ['pending', 'in-progress', 'completed', 'in-pause', 'discarded'] as const
export type TaskState = (typeof TASK_STATES)[number]

export class CreateTaskDto {
  @ApiPropertyOptional({
    type: ParentReferenceDto,
    description: 'Optional parent. When omitted or empty, the authenticated User is used.'
  })
  @IsOptional()
  parent?: unknown

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
}
