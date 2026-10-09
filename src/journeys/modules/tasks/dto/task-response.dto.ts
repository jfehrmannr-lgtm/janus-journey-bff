import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TASK_STATES, type TaskState } from './create-task.dto.js'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'

export class TaskResponseDto {
  @ApiProperty()
  uid!: string

  @ApiProperty({ enum: ['task'] })
  type!: 'task'

  @ApiProperty({ type: ParentReferenceDto })
  parent!: ParentReferenceDto

  @ApiProperty()
  name!: string

  @ApiProperty({ example: 'Description for task', nullable: true, type: String })
  description!: string | null

  @ApiProperty({ nullable: true, type: String })
  taskType!: null

  @ApiProperty({ enum: TASK_STATES })
  state!: TaskState

  @ApiProperty()
  isVisible!: boolean

  @ApiPropertyOptional({ example: 100, type: Number })
  orderIndex?: unknown

  @ApiProperty({ type: Object })
  metadata!: Record<string, unknown>

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date
}
