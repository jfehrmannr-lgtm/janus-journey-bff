import { IsEnum, IsString, Length } from 'class-validator'

export type ResourceType = 'journey' | 'folder' | 'task'

export class ResourceParamsDto {
  @IsEnum(['journey', 'folder', 'task'])
  resourceType!: ResourceType

  @IsString()
  @Length(1, 255)
  resourceId!: string
}
