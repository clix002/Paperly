import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { user } from "./auth"
import { document } from "./document"

export const comment = pgTable("comment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  content: text("content").notNull(),
  documentId: text("document_id")
    .notNull()
    .references(() => document.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  parentId: text("parent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
