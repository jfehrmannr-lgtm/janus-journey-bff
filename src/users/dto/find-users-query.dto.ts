import { IsBoolean, IsEmail, IsIn, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationQueryDto } from '@common/collections/pagination-query.dto.js'

export class FindUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'email' })
  @IsEmail()
  @IsOptional()
  email?: string

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  @Transform(({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value))
  isVerified?: boolean

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  username?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  userId?: string

  @IsIn(['createdAt', 'updatedAt', 'userId', 'email'])
  @IsOptional()
  @ApiPropertyOptional({ enum: ['createdAt', 'updatedAt', 'userId', 'email'], default: 'createdAt' })
  sortBy: 'createdAt' | 'updatedAt' | 'userId' | 'email' = 'createdAt'

  @IsIn(['asc', 'desc'])
  @IsOptional()
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  sortOrder: 'asc' | 'desc' = 'asc'
}
