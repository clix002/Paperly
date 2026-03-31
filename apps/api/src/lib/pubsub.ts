import type { comment } from "@paperly/db"
import { createPubSub } from "graphql-yoga"

type CommentRow = typeof comment.$inferSelect

export const pubSub = createPubSub<{
  [key: `COMMENT_ADDED:${string}`]: [CommentRow]
}>()
