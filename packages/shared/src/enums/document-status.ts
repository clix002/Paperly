export const DocumentStatus = {
  DRAFT: "draft",
  SENT: "sent",
  VIEWED: "viewed",
  IN_REVIEW: "in_review",
  SIGNED: "signed",
  REJECTED: "rejected",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const

export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus]
