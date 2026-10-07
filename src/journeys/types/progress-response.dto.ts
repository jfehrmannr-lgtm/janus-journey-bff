import { ApiProperty } from '@nestjs/swagger'

export class ProgressResponseDto {
  @ApiProperty()
  completed!: number

  @ApiProperty()
  discarded!: number

  @ApiProperty()
  total!: number

  @ApiProperty()
  percentage!: number
}
