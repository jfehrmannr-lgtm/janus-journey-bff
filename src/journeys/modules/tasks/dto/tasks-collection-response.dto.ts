import { ApiProperty } from '@nestjs/swagger'
import { PaginationResponseDto } from '@common/collections/pagination-response.dto.js'
import { TaskResponseDto } from './task-response.dto.js'

export class TasksCollectionResponseDto {
  @ApiProperty({ type: TaskResponseDto, isArray: true })
  payload!: TaskResponseDto[]

  @ApiProperty({ type: PaginationResponseDto })
  pagination!: PaginationResponseDto

  @ApiProperty({ type: Object, description: 'No filters are currently supported.' })
  filters!: Record<string, never>
}
