import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString, Length } from 'class-validator'

export class UpdateJourneyDto {
  @ApiPropertyOptional({ description: 'UID of the owning User.' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  parentUid?: string

  @ApiPropertyOptional({ example: 'Updated Journey name' })
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
  @IsObject()
  metadata?: Record<string, unknown>
}
