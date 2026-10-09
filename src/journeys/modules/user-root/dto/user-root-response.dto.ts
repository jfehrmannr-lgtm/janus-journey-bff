import { ApiProperty } from '@nestjs/swagger'
import { FolderResponseDto } from '../../folders/dto/folder-response.dto.js'
import { JourneyResponseDto } from '../../journeys/dto/journey-response.dto.js'
import { TaskResponseDto } from '../../tasks/dto/task-response.dto.js'

export class UserRootItemsResponseDto {
  @ApiProperty({ type: [TaskResponseDto] })
  tasks!: TaskResponseDto[]

  @ApiProperty({ type: [FolderResponseDto] })
  folders!: FolderResponseDto[]

  @ApiProperty({ type: [JourneyResponseDto] })
  journeys!: JourneyResponseDto[]
}

export class UserRootResponseDto {
  @ApiProperty({ type: UserRootItemsResponseDto })
  payload!: UserRootItemsResponseDto

  @ApiProperty({
    description: 'Number of non-empty root resource collections.',
    enum: [0, 1, 2, 3],
    example: 2,
    type: 'integer'
  })
  registers!: number
}
