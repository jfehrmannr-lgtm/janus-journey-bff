import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, Length, ValidateNested } from 'class-validator'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'

export const TASK_STATES = ['pending', 'in-progress', 'complete', 'in-pause', 'discarded'] as const
export type TaskState = (typeof TASK_STATES)[number]

export class CreateTaskDto {
  @ApiProperty({ type: ParentReferenceDto })
  @ValidateNested()
  @Type(() => ParentReferenceDto)
  parent!: ParentReferenceDto

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
