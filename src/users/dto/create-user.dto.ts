import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  ValidateIf,
  ValidateNested
} from 'class-validator'

class CreateUserConfigDto {
  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', format: 'uri', nullable: true, type: String })
  @ValidateIf((_, value: unknown) => value !== null && value !== undefined)
  @IsUrl({ require_protocol: true })
  avatarUrl?: string | null

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  username!: string
}

class CreateUserAuthLoginDto {
  @ApiProperty({ example: 'oauth-google-123456789' })
  @IsString()
  @Length(1, 255)
  authLogin!: string

  @ApiProperty({ enum: ['platform', 'google', 'github', 'microsoft'] })
  @IsIn(['platform', 'google', 'github', 'microsoft'])
  provider!: 'platform' | 'google' | 'github' | 'microsoft'

  @ApiPropertyOptional({ nullable: true })
  @ValidateIf((_, value: unknown) => value !== null && value !== undefined)
  @IsEmail()
  providerEmail?: string | null

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  providerUsername?: string | null

  @ApiPropertyOptional({ nullable: true })
  @ValidateIf((_, value: unknown) => value !== null && value !== undefined)
  @IsUrl({ require_protocol: true })
  providerAvatarUrl?: string | null

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>
}

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string

  @ApiProperty({ type: CreateUserConfigDto })
  @ValidateNested()
  @Type(() => CreateUserConfigDto)
  config!: CreateUserConfigDto

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>

  @ApiProperty({ type: CreateUserAuthLoginDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateUserAuthLoginDto)
  authLogins!: CreateUserAuthLoginDto[]
}
