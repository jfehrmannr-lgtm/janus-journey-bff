import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString, Length } from 'class-validator'

export class CreateJourneyDto {
  @ApiProperty({ description: 'UID of the owning User.' })
  @IsString()
  @Length(1, 255)
  parentUid!: string

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
