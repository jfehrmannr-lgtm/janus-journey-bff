import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProgressResponseDto } from '../../../types/progress-response.dto.js'

export class JourneyResponseDto {
  @ApiProperty()
  uid!: string

  @ApiProperty({ enum: ['journey'] })
  type!: 'journey'

  @ApiProperty()
  parentUid!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ nullable: true })
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
