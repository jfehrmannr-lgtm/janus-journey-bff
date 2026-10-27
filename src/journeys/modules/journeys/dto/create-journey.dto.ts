import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString, Length } from 'class-validator'
import { ParentReferenceDto } from '@common/parent-reference.dto.js'

export class CreateJourneyDto {
  @ApiPropertyOptional({
    type: ParentReferenceDto,
    description: 'Optional parent. When omitted or empty, the authenticated User is used.'
  })
  @IsOptional()
  parent?: unknown

  @ApiProperty({ example: 'Learn web development' })
  @IsString()
  @Length(1, 255)
  name!: string

  @ApiPropertyOptional({ nullable: true, example: 'A structured learning path.' })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiProperty({ example: '/janus_journey_backgrounds/mount-sunrise.png' })
  @IsString()
  imgUrl!: string

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>
}
