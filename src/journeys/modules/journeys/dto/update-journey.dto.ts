import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsObject, IsOptional, IsString, Length, ValidateNested } from 'class-validator'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'

export class UpdateJourneyDto {
  @ApiPropertyOptional({ type: ParentReferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ParentReferenceDto)
  parent?: ParentReferenceDto

  @ApiPropertyOptional({ example: 'Updated Journey name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string

  @ApiPropertyOptional({ example: 'Description for journey', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>
}
