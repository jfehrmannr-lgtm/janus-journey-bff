import { ApiProperty } from '@nestjs/swagger'

export class PaginationResponseDto {
  @ApiProperty({ minimum: 1 })
  page!: number

  @ApiProperty({ minimum: 1 })
  size!: number

  @ApiProperty({ minimum: 0 })
  length!: number

  @ApiProperty({ minimum: 0 })
  totalRecords!: number

  @ApiProperty({ minimum: 0 })
  totalPages!: number
}
