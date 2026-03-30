import { boolean, json, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { user } from "./auth"
import { documentCategory } from "./document-category"
import { template } from "./template"

export const documentStatusEnum = pgEnum("document_status", [
  "draft",
  "sent",
  "viewed",
  "in_review",
  "signed",
  "rejected",
  "completed",
  "archived",
])

export const document = pgTable("document", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  contentJson: json("content_json"),
  status: documentStatusEnum("status").notNull().default("draft"),
  requiresSignature: boolean("requires_signature").notNull().default(false),
  senderId: text("sender_id").references(() => user.id, { onDelete: "set null" }),
  receiverId: text("receiver_id").references(() => user.id, { onDelete: "set null" }),
  templateId: text("template_id").references(() => template.id, { onDelete: "set null" }),
  categoryId: text("category_id").references(() => documentCategory.id, { onDelete: "set null" }),
  originalDocumentId: text("original_document_id"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
