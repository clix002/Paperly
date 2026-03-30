import { EditorType } from "@/components/editor/types"
import { DocumentStatus } from "@/lib/apollo/generated/graphql"

export type DocumentContext = {
  editorType: EditorType
  canSign: boolean
  showObservationsButton: boolean
  openCommentsByDefault: boolean
  inReviewBanner: boolean
  primaryAction: "mark_viewed" | null
}

export const PENDING_STATUSES = new Set<string>([DocumentStatus.Sent, DocumentStatus.Viewed])

export function buildDocumentContext(status: string, requiresSignature: boolean): DocumentContext {
  if (status === DocumentStatus.InReview) {
    return {
      editorType: EditorType.View,
      canSign: false,
      showObservationsButton: true,
      openCommentsByDefault: true,
      inReviewBanner: true,
      primaryAction: null,
    }
  }

  const isPending = PENDING_STATUSES.has(status)

  if (isPending && requiresSignature) {
    return {
      editorType: EditorType.Sign,
      canSign: true,
      showObservationsButton: false,
      openCommentsByDefault: false,
      inReviewBanner: false,
      primaryAction: null,
    }
  }

  if (isPending && !requiresSignature) {
    return {
      editorType: EditorType.View,
      canSign: false,
      showObservationsButton: true,
      openCommentsByDefault: false,
      inReviewBanner: false,
      primaryAction: "mark_viewed",
    }
  }

  return {
    editorType: EditorType.View,
    canSign: false,
    showObservationsButton: true,
    openCommentsByDefault: false,
    inReviewBanner: false,
    primaryAction: null,
  }
}
