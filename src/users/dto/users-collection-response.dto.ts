import { ApiProperty } from '@nestjs/swagger'
import { PaginationResponseDto } from '@common/collections/pagination-response.dto.js'
import { UserFiltersDto } from './user-filters.dto.js'
import { UserResponseDto } from './user-response.dto.js'

export class UsersCollectionResponseDto {
  @ApiProperty({ type: UserResponseDto, isArray: true })
  payload!: UserResponseDto[]

  @ApiProperty({ type: PaginationResponseDto })
  pagination!: PaginationResponseDto

  @ApiProperty({ type: UserFiltersDto })
  filters!: UserFiltersDto
}
