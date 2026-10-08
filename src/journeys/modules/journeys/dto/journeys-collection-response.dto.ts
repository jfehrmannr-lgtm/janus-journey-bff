import { ApiProperty } from '@nestjs/swagger'
import { PaginationResponseDto } from '@common/collections/pagination-response.dto.js'
import { JourneyResponseDto } from './journey-response.dto.js'

export class JourneysCollectionResponseDto {
  @ApiProperty({ type: JourneyResponseDto, isArray: true })
  payload!: JourneyResponseDto[]

  @ApiProperty({ type: PaginationResponseDto })
  pagination!: PaginationResponseDto

  @ApiProperty({ type: Object, description: 'No filters are currently supported.' })
  filters!: Record<string, never>
}
