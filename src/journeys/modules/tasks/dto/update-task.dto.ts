import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, Length } from 'class-validator'
import { TASK_STATES, type TaskState } from './create-task.dto.js'

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'UID of the owning User, Journey, or Folder.' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  parentUid?: string

  @ApiPropertyOptional({ example: 'Updated task name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string

  @ApiPropertyOptional({ nullable: true })
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

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  orderIndex?: unknown

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>
}
