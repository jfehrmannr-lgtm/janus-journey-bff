import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString, Length } from 'class-validator'

export class UpdateFolderDto {
  @ApiPropertyOptional({ description: 'UID of the owning User or Journey.' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  parentUid?: string

  @ApiPropertyOptional({ example: 'Updated folder name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  orderIndex?: unknown

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>
}
