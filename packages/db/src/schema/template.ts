import { boolean, json, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { user } from "./auth"
import { documentCategory } from "./document-category"

export const templateStatusEnum = pgEnum("template_status", ["draft", "published"])

export const template = pgTable("template", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  description: text("description"),
  contentJson: json("content_json"),
  status: templateStatusEnum("status").notNull().default("draft"),
  isPublic: boolean("is_public").notNull().default(false),
  createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
  categoryId: text("category_id").references(() => documentCategory.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
