import { user as userTable } from "@paperly/db"
import DataLoader from "dataloader"
import { inArray } from "drizzle-orm"
import { keyBy } from "es-toolkit"
import type { IContext } from "../../context"

export const getUserDataLoader = (ctx: IContext) =>
  new DataLoader<string, typeof userTable.$inferSelect | null>(async (ids) => {
    const users = await ctx.db
      .select()
      .from(userTable)
      .where(inArray(userTable.id, [...ids]))
    const userById = keyBy(users, (u) => u.id)
    return ids.map((id) => userById[id] ?? null)
  })
