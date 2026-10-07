export interface DownstreamResponse<TBody = unknown> {
  readonly status: number
  readonly body: TBody
  readonly headers: Readonly<Record<string, string>>
}

import type { CollectionResult } from '@common/collections/collection.types.js'

export type MsJourneysCollectionResult = CollectionResult<unknown>
