import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsString, Length } from 'class-validator'

export class ParentReferenceDto {
  @ApiProperty({ example: 'journey-123' })
  @IsString()
  @Length(1, 255)
  uid!: string

  @ApiProperty({ enum: ['user', 'journey', 'folder'] })
  @IsIn(['user', 'journey', 'folder'])
  type!: 'user' | 'journey' | 'folder'
}
