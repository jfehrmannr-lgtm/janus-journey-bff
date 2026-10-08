import { ApiProperty } from '@nestjs/swagger'
import { PaginationResponseDto } from '@common/collections/pagination-response.dto.js'
import { FolderResponseDto } from './folder-response.dto.js'

export class FoldersCollectionResponseDto {
  @ApiProperty({ type: FolderResponseDto, isArray: true })
  payload!: FolderResponseDto[]

  @ApiProperty({ type: PaginationResponseDto })
  pagination!: PaginationResponseDto

  @ApiProperty({ type: Object, description: 'No filters are currently supported.' })
  filters!: Record<string, never>
}
