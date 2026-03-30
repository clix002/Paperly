import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { user } from "./auth"
import { document } from "./document"

export const distributionStatusEnum = pgEnum("distribution_status", [
  "pending",
  "sent",
  "viewed",
  "signed",
  "rejected",
  "completed",
])

export const documentDistribution = pgTable("document_distribution", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  documentId: text("document_id")
    .notNull()
    .references(() => document.id, { onDelete: "cascade" }),
  senderId: text("sender_id").references(() => user.id, { onDelete: "set null" }),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: distributionStatusEnum("status").notNull().default("pending"),
  requiresSignature: boolean("requires_signature").notNull().default(false),
  message: text("message"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
