import { Archive, CheckCircle2, Eye, Send } from "lucide-react"
import { DocumentStatus } from "@/lib/apollo/generated/graphql"

export type TrackedDoc = {
  id: string
  title: string
  status: string
  requiresSignature: boolean
  originalDocumentId?: string | null
  createdAt: string
  updatedAt: string
  sender?: { id: string; name: string } | null
  receiver?: { id: string; name: string } | null
}

export type Comment = {
  id: string
  content: string
  createdAt: string
  author?: {
    id: string
    name: string
    role: string
    image?: string | null
  } | null
}

export const VIEW_MODE = {
  LIST: "list",
  KANBAN: "kanban",
} as const

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE]

export type StatusAction = {
  label: string
  icon: typeof Eye
  targetStatus?: DocumentStatus
  variant?: "default" | "secondary"
}

export const TABS: readonly {
  key: string
  label: string
  shortLabel: string
  statuses?: DocumentStatus[]
}[] = [
  { key: "all", label: "Todos", shortLabel: "Todos" },
  {
    key: "pending",
    label: "Pendientes",
    shortLabel: "Pend.",
    statuses: [DocumentStatus.Sent, DocumentStatus.Viewed],
  },
  {
    key: "review",
    label: "En revisión",
    shortLabel: "Revisión",
    statuses: [DocumentStatus.InReview],
  },
  { key: "signed", label: "Firmados", shortLabel: "Firmados", statuses: [DocumentStatus.Signed] },
  {
    key: "done",
    label: "Finalizados",
    shortLabel: "Final.",
    statuses: [DocumentStatus.Completed, DocumentStatus.Archived, DocumentStatus.Rejected],
  },
]

export const STATUS_ACTIONS: Partial<Record<DocumentStatus, StatusAction[]>> = {
  [DocumentStatus.Sent]: [{ label: "Esperando apertura del trabajador", icon: Eye }],
  [DocumentStatus.Viewed]: [{ label: "El trabajador ha visto el documento", icon: Eye }],
  [DocumentStatus.InReview]: [
    {
      label: "Reenviar corregido",
      icon: Send,
      targetStatus: DocumentStatus.Sent,
      variant: "default",
    },
  ],
  [DocumentStatus.Signed]: [
    {
      label: "Marcar completado",
      icon: CheckCircle2,
      targetStatus: DocumentStatus.Completed,
      variant: "default",
    },
  ],
  [DocumentStatus.Rejected]: [
    {
      label: "Archivar",
      icon: Archive,
      targetStatus: DocumentStatus.Archived,
      variant: "secondary",
    },
  ],
  [DocumentStatus.Completed]: [
    {
      label: "Archivar",
      icon: Archive,
      targetStatus: DocumentStatus.Archived,
      variant: "secondary",
    },
  ],
}

export type TimelineStep = {
  status: DocumentStatus
  label: string
}

export const STATUS_TIMELINE: TimelineStep[] = [
  { status: DocumentStatus.Sent, label: "Enviado" },
  { status: DocumentStatus.Viewed, label: "Visto" },
  { status: DocumentStatus.InReview, label: "En revisión" },
  { status: DocumentStatus.Signed, label: "Firmado" },
  { status: DocumentStatus.Completed, label: "Completado" },
  { status: DocumentStatus.Archived, label: "Archivado" },
  { status: DocumentStatus.Rejected, label: "Rechazado" },
]

const MAIN_FLOW: DocumentStatus[] = [
  DocumentStatus.Sent,
  DocumentStatus.Viewed,
  DocumentStatus.InReview,
  DocumentStatus.Signed,
  DocumentStatus.Completed,
  DocumentStatus.Archived,
]

const DEFAULT_VISIBLE: DocumentStatus[] = [
  DocumentStatus.Sent,
  DocumentStatus.Viewed,
  DocumentStatus.Signed,
  DocumentStatus.Completed,
]

const REJECTED_FLOW: DocumentStatus[] = [
  DocumentStatus.Sent,
  DocumentStatus.Viewed,
  DocumentStatus.Rejected,
]

export function getReachedStatuses(currentStatus: DocumentStatus | string): DocumentStatus[] {
  const idx = MAIN_FLOW.indexOf(currentStatus as DocumentStatus)
  if (idx >= 0) return MAIN_FLOW.slice(0, idx + 1)
  if (currentStatus === DocumentStatus.Rejected) return REJECTED_FLOW
  return [currentStatus as DocumentStatus]
}

export function getVisibleSteps(currentStatus: DocumentStatus | string): TimelineStep[] {
  const reached = getReachedStatuses(currentStatus)
  return STATUS_TIMELINE.filter((step) => {
    if (reached.includes(step.status)) return true
    if (currentStatus === DocumentStatus.Rejected) return step.status === DocumentStatus.Rejected
    return DEFAULT_VISIBLE.includes(step.status)
  })
}

export function filterByTab(docs: TrackedDoc[], tabKey: string): TrackedDoc[] {
  const tab = TABS.find((t) => t.key === tabKey)
  const { statuses } = tab ?? {}
  if (!statuses) return docs
  return docs.filter((d) => statuses.includes(d.status as DocumentStatus))
}

export function filterBySearch(docs: TrackedDoc[], search: string): TrackedDoc[] {
  if (!search) return docs
  const q = search.toLowerCase()
  return docs.filter((d) => {
    const matchTitle = d.title.toLowerCase().includes(q)
    const matchReceiver = d.receiver?.name.toLowerCase().includes(q)
    return matchTitle || matchReceiver
  })
}
