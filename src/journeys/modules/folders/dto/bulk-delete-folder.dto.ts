import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, ArrayUnique, IsArray, IsString, Length } from 'class-validator'

export class BulkDeleteFolderDto {
  @ApiProperty({
    description: 'Folder resource IDs to delete.',
    example: ['folder-1', 'folder-2'],
    isArray: true,
    minItems: 1,
    type: String
  })
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 255, { each: true })
  ids!: string[]
}
