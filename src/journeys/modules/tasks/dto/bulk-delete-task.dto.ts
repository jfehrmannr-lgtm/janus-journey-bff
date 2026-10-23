import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, ArrayUnique, IsArray, IsString, Length } from 'class-validator'

export class BulkDeleteTaskDto {
  @ApiProperty({
    description: 'Task resource IDs to delete.',
    example: ['task-1', 'task-2'],
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
