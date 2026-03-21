import type { DB } from "@paperly/db"
import type { SQL, Table } from "drizzle-orm"
import { count } from "drizzle-orm"
import type { PaginateOptions, PaginateResult } from "./types"

const DEFAULT_LIMIT = 20

interface PaginateParams<T> {
  db: DB
  table: Table
  where?: SQL
  options?: PaginateOptions | null
  query: {
    limit(n: number): { offset(n: number): PromiseLike<T[]> }
  }
}

export async function paginate<T>({
  db,
  table,
  where,
  options,
  query,
}: PaginateParams<T>): Promise<PaginateResult<T>> {
  const limit = options?.limit ?? DEFAULT_LIMIT
  const page = options?.page ?? 1
  const offset = (page - 1) * limit

  const countQuery = db.select({ total: count() }).from(table)
  if (where) {
    countQuery.where(where)
  }

  const [docs, [countResult]] = await Promise.all([query.limit(limit).offset(offset), countQuery])

  const totalDocs = countResult?.total ?? 0
  const totalPages = Math.ceil(totalDocs / limit)

  return {
    docs,
    info: {
      totalDocs,
      limit,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      ...(page < totalPages && { nextPage: page + 1 }),
      ...(page > 1 && { prevPage: page - 1 }),
    },
  }
}
