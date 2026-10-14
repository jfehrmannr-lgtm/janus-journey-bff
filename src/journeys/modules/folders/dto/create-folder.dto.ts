import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString, Length } from 'class-validator'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'

export class CreateFolderDto {
  @ApiPropertyOptional({
    type: ParentReferenceDto,
    description: 'Optional parent. When omitted or empty, the authenticated User is used.'
  })
  @IsOptional()
  parent?: unknown

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
