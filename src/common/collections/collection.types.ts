export interface CollectionResult<T> {
  readonly items: T[]
  readonly totalRecords: number
}

export interface PaginationResponse {
  readonly page: number
  readonly size: number
  readonly length: number
  readonly totalRecords: number
  readonly totalPages: number
}

export interface CollectionResponse<T, TFilters> {
  readonly payload: T[]
  readonly pagination: PaginationResponse
  readonly filters: TFilters
}
