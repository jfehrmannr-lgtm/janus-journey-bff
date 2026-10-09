import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, Length, ValidateNested } from 'class-validator'
import { TASK_STATES, type TaskState } from './create-task.dto.js'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'

export class UpdateTaskDto {
  @ApiPropertyOptional({ type: ParentReferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ParentReferenceDto)
  parent?: ParentReferenceDto

  @ApiPropertyOptional({ example: 'Updated task name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string

  @ApiPropertyOptional({ example: 'Description for task', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiPropertyOptional({ enum: TASK_STATES })
  @IsOptional()
  @IsIn(TASK_STATES)
  state?: TaskState

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean

  @ApiPropertyOptional({ example: 100, type: Number })
  @IsOptional()
  orderIndex?: unknown

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>
}
