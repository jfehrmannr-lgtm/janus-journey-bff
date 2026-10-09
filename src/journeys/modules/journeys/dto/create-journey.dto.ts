import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsObject, IsOptional, IsString, Length, ValidateNested } from 'class-validator'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'

export class CreateJourneyDto {
  @ApiProperty({ type: ParentReferenceDto })
  @ValidateNested()
  @Type(() => ParentReferenceDto)
  parent!: ParentReferenceDto

  @ApiProperty({ example: 'Learn web development' })
  @IsString()
  @Length(1, 255)
  name!: string

  @ApiPropertyOptional({ nullable: true, example: 'A structured learning path.' })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>
}
