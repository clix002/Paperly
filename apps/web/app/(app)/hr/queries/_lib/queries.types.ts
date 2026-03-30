import { Archive, CheckCircle2 } from "lucide-react"
import { DocumentStatus } from "@/lib/apollo/generated/graphql"

export const QUERY_TAB = {
  ATTENTION: "attention",
  ALL: "all",
} as const

export type QueryTab = (typeof QUERY_TAB)[keyof typeof QUERY_TAB]

export type ConvoDoc = {
  id: string
  title: string
  status: string
  requiresSignature: boolean
  originalDocumentId?: string | null
  createdAt: string
  updatedAt: string
  receiver?: { id: string; name: string } | null
}

export type CommentType = {
  id: string
  content: string
  createdAt: string
  author?: { id: string; name: string; role: string } | null
}

export type ThreadAction = {
  label: string
  target: DocumentStatus
  icon: typeof CheckCircle2
  variant: "default" | "secondary" | "outline"
}

export const THREAD_ACTIONS: Partial<Record<string, ThreadAction>> = {
  in_review: {
    label: "Reenviar al trabajador",
    target: DocumentStatus.Sent,
    icon: CheckCircle2,
    variant: "default",
  },
  rejected: {
    label: "Archivar",
    target: DocumentStatus.Archived,
    icon: Archive,
    variant: "secondary",
  },
  signed: {
    label: "Marcar completado",
    target: DocumentStatus.Completed,
    icon: CheckCircle2,
    variant: "default",
  },
}
