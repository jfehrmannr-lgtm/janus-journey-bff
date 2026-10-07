import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TASK_STATES, type TaskState } from './create-task.dto.js'

export class TaskResponseDto {
  @ApiProperty()
  uid!: string

  @ApiProperty({ enum: ['task'] })
  type!: 'task'

  @ApiProperty()
  parentUid!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ nullable: true })
  description!: string | null

  @ApiProperty({ nullable: true, type: String })
  taskType!: null

  @ApiProperty({ enum: TASK_STATES })
  state!: TaskState

  @ApiProperty()
  isVisible!: boolean

  @ApiPropertyOptional({ type: Object })
  orderIndex?: unknown

  @ApiProperty({ type: Object })
  metadata!: Record<string, unknown>

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date
}
