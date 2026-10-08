import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class UserConfigResponseDto {
  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', format: 'uri', nullable: true, type: String })
  avatarUrl!: string | null

  @ApiProperty()
  username!: string
}

class AuthLoginResponseDto {
  @ApiProperty()
  authLogin!: string

  @ApiProperty({ enum: ['platform', 'google', 'github', 'microsoft'] })
  provider!: string

  @ApiProperty({ nullable: true })
  providerEmail!: string | null

  @ApiProperty({ nullable: true })
  providerUsername!: string | null

  @ApiProperty({ nullable: true })
  providerAvatarUrl!: string | null

  @ApiProperty({ type: Object })
  metadata!: Record<string, unknown>

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date

  @ApiProperty({ format: 'date-time' })
  lastLoginAt!: Date
}

export class UserResponseDto {
  @ApiProperty({ format: 'date-time' })
  createdAt!: Date

  @ApiProperty({ type: UserConfigResponseDto })
  config!: UserConfigResponseDto

  @ApiProperty({ type: AuthLoginResponseDto, isArray: true })
  authLogins!: AuthLoginResponseDto[]

  @ApiProperty()
  email!: string

  @ApiProperty()
  id!: string

  @ApiProperty()
  isVerified!: boolean

  @ApiProperty({ type: Object })
  metadata!: Record<string, unknown>

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date

  @ApiProperty()
  userId!: string
}
