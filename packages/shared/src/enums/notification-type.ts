export const NotificationType = {
  DOCUMENT_SENT: "document_sent",
  DOCUMENT_VIEWED: "document_viewed",
  DOCUMENT_SIGNED: "document_signed",
  DOCUMENT_REJECTED: "document_rejected",
  DOCUMENT_COMPLETED: "document_completed",
  COMMENT_RECEIVED: "comment_received",
  DOCUMENT_IN_REVIEW: "document_in_review",
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]
