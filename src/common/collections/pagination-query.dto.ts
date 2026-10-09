import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsDefined, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export const MAX_PAGE_SIZE = 200

export class PaginationQueryDto {
  @ApiProperty({
    minimum: 1,
    required: true,
    description: 'Requested collection page.',
    default: 1,
    example: 1,
    type: 'integer'
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page!: number

  @ApiProperty({
    minimum: 1,
    required: true,
    description: 'Requested page size. Values above 200 are normalized to 200.',
    default: 20,
    example: 20,
    type: 'integer'
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  size!: number
}

export const effectivePageSize = (size: number): number => Math.min(size, MAX_PAGE_SIZE)
