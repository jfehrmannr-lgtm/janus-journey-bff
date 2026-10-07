import { ApiPropertyOptional } from '@nestjs/swagger'

export class UserFiltersDto {
  @ApiPropertyOptional({ format: 'email' })
  email?: string

  @ApiPropertyOptional()
  isVerified?: boolean

  @ApiPropertyOptional()
  username?: string

  @ApiPropertyOptional()
  userId?: string

  @ApiPropertyOptional({ enum: ['createdAt', 'updatedAt', 'userId', 'email'], default: 'createdAt' })
  sortBy!: 'createdAt' | 'updatedAt' | 'userId' | 'email'

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  sortOrder!: 'asc' | 'desc'
}
