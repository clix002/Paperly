import type { Maybe } from "graphql-yoga"

export interface PaginateOptions {
  limit?: Maybe<number>
  page?: Maybe<number>
}

export interface PaginateInfo {
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage?: number
  prevPage?: number
}

export interface PaginateResult<T> {
  docs: T[]
  info: PaginateInfo
}
