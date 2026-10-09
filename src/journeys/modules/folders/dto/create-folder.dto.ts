import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsObject, IsOptional, IsString, Length, ValidateNested } from 'class-validator'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'

export class CreateFolderDto {
  @ApiProperty({ type: ParentReferenceDto })
  @ValidateNested()
  @Type(() => ParentReferenceDto)
  parent!: ParentReferenceDto

  @ApiProperty({ example: 'HTML and CSS' })
  @IsString()
  @Length(1, 255)
  name!: string

  @ApiPropertyOptional({ example: 'Description for folder', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiPropertyOptional({ example: 100, type: Number })
  @IsOptional()
  orderIndex?: unknown

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>
}
