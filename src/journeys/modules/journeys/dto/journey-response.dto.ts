import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProgressResponseDto } from '@journeys/types/progress-response.dto.js'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'

export class JourneyResponseDto {
  @ApiProperty()
  uid!: string

  @ApiProperty({ enum: ['journey'] })
  type!: 'journey'

  @ApiProperty({ type: ParentReferenceDto })
  parent!: ParentReferenceDto

  @ApiProperty()
  name!: string

  @ApiProperty({ example: 'Description for journey', nullable: true, type: String })
  description!: string | null

  @ApiProperty({ type: Object })
  metadata!: Record<string, unknown>

  @ApiPropertyOptional({ type: ProgressResponseDto })
  progress?: ProgressResponseDto

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date
}
