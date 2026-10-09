import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsString, IsUrl, Length, ValidateNested } from 'class-validator'

class UpdateUserConfigDto {
  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', format: 'uri', nullable: true, type: String })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  avatarUrl?: string | null

  @ApiPropertyOptional({ example: 'johann' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  username?: string
}

export class UpdateUserDto {
  @ApiPropertyOptional({ type: UpdateUserConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserConfigDto)
  config?: UpdateUserConfigDto
}
