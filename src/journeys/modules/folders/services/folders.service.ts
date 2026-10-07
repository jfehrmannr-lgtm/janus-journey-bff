import { Injectable } from '@nestjs/common'
import { MsJourneysClient } from '../../../clients/ms-journeys.client.js'
import type { DownstreamResponse } from '../../../types/ms-journeys.types.js'
import type { CreateFolderDto } from '../dto/create-folder.dto.js'
import type { UpdateFolderDto } from '../dto/update-folder.dto.js'

@Injectable()
export class FoldersService {
  constructor(private readonly client: MsJourneysClient) {}

  create(payload: CreateFolderDto): Promise<DownstreamResponse> {
    return this.client.createFolder(payload)
  }

  findAll(): Promise<DownstreamResponse> {
    return this.client.findAllFolders()
  }

  findByUid(uid: string): Promise<DownstreamResponse> {
    return this.client.findFolderByUid(uid)
  }

  replace(uid: string, payload: UpdateFolderDto): Promise<DownstreamResponse> {
    return this.client.replaceFolder(uid, payload)
  }

  update(uid: string, payload: UpdateFolderDto): Promise<DownstreamResponse> {
    return this.client.updateFolder(uid, payload)
  }

  remove(uid: string): Promise<DownstreamResponse> {
    return this.client.removeFolder(uid)
  }
}
