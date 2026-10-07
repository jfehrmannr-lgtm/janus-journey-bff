import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsIn, IsObject, IsOptional, IsString, Length } from 'class-validator'

export const TASK_STATES = ['pending', 'in-progress', 'complete', 'in-pause', 'discarded'] as const
export type TaskState = (typeof TASK_STATES)[number]

export class CreateTaskDto {
  @ApiProperty({ description: 'UID of the owning User, Journey, or Folder.' })
  @IsString()
  @Length(1, 255)
  parentUid!: string

  @ApiProperty({ example: 'Understand HTTP' })
  @IsString()
  @Length(1, 255)
  name!: string

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiProperty({ enum: TASK_STATES })
  @IsIn(TASK_STATES)
  state!: TaskState

  @ApiProperty({ default: true })
  @IsBoolean()
  isVisible!: boolean

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  orderIndex?: unknown

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>
}
