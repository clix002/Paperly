import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { user } from "./auth"
import { document } from "./document"

export const notification = pgTable("notification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  isRead: boolean("is_read").notNull().default(false),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  documentId: text("document_id").references(() => document.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
