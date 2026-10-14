import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString, Length } from 'class-validator'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'

export class BulkCreateFolderItemDto {
  @ApiPropertyOptional({
    description: 'Optional Folder parent. When omitted, the authenticated User is used.',
    example: { uid: 'journey-123', type: 'journey' },
    type: ParentReferenceDto
  })
  @IsOptional()
  parent?: ParentReferenceDto

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

  @ApiPropertyOptional({
    description: 'Optional client correlation value. It is not an ownership reference.',
    example: 'folder-client-1'
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  clientId?: string
}

export type ResolvedBulkFolderItem = Omit<BulkCreateFolderItemDto, 'parent'> & {
  parent: ParentReferenceDto
}
