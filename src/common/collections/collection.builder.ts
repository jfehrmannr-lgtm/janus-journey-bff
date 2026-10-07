import type { CollectionResponse, PaginationResponse } from './collection.types.js'

export const buildCollectionResponse = <T, TFilters>(
  items: T[],
  totalRecords: number,
  page: number,
  size: number,
  filters: TFilters
): CollectionResponse<T, TFilters> => {
  const pagination: PaginationResponse = {
    page,
    size,
    length: items.length,
    totalRecords,
    totalPages: totalRecords === 0 ? 0 : Math.ceil(totalRecords / size)
  }

  return { filters, pagination, payload: items }
}
