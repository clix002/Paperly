import { json, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { user } from "./auth"
import { document } from "./document"

export const history = pgTable("history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  action: text("action").notNull(),
  changesJson: json("changes_json"),
  documentId: text("document_id").references(() => document.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
