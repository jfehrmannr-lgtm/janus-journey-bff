import { BadGatewayException } from '@nestjs/common'
import type { CollectionResult } from './collection.types.js'

export const parseCollectionResult = <T>(body: unknown): CollectionResult<T> => {
  if (typeof body !== 'object' || body === null || !('items' in body) || !('totalRecords' in body)) {
    throw new BadGatewayException('The downstream collection response is invalid')
  }

  const result = body as { readonly items: unknown; readonly totalRecords: unknown }

  if (
    !Array.isArray(result.items) ||
    typeof result.totalRecords !== 'number' ||
    !Number.isInteger(result.totalRecords) ||
    result.totalRecords < 0
  ) {
    throw new BadGatewayException('The downstream collection response is invalid')
  }

  return { items: result.items as T[], totalRecords: result.totalRecords }
}
