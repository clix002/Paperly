import { document as documentTable, template as templateTable } from "@paperly/db"
import DataLoader from "dataloader"
import { inArray } from "drizzle-orm"
import { keyBy } from "es-toolkit"
import type { IContext } from "../../context"

export const getDocumentDataLoader = (ctx: IContext) =>
  new DataLoader<string, typeof documentTable.$inferSelect | null>(async (ids) => {
    const docs = await ctx.db
      .select()
      .from(documentTable)
      .where(inArray(documentTable.id, [...ids]))
    const docById = keyBy(docs, (d) => d.id)
    return ids.map((id) => docById[id] ?? null)
  })

export const getTemplateDataLoader = (ctx: IContext) =>
  new DataLoader<string, typeof templateTable.$inferSelect | null>(async (ids) => {
    const templates = await ctx.db
      .select()
      .from(templateTable)
      .where(inArray(templateTable.id, [...ids]))
    const tmplById = keyBy(templates, (t) => t.id)
    return ids.map((id) => tmplById[id] ?? null)
  })
