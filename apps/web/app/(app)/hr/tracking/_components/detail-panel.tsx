"use client"

import { useMutation } from "@apollo/client/react"
import { Pencil, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { DocumentStatusBadge } from "@/components/dashboard/document-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DocumentStatus, UpdateDocumentDocument } from "@/lib/apollo/generated/graphql"
import { cn, formatRelativeDate } from "@/lib/utils"
import {
  getReachedStatuses,
  getVisibleSteps,
  STATUS_ACTIONS,
  type TrackedDoc,
} from "../_lib/tracking"
import { ConversationPanel } from "./conversation-panel"

const STATUS_BAR_COLOR: Record<string, string> = {
  sent: "bg-blue-500",
  viewed: "bg-violet-500",
  in_review: "bg-amber-500",
  signed: "bg-emerald-500",
  completed: "bg-emerald-500",
  rejected: "bg-red-500",
  archived: "bg-gray-400",
}

interface DetailPanelProps {
  doc: TrackedDoc
  onClose: () => void
  onStatusChange: () => void
}

export function DetailPanel({ doc, onClose, onStatusChange }: DetailPanelProps) {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className={cn("h-1 shrink-0", STATUS_BAR_COLOR[doc.status] ?? "bg-muted")} />
      <DetailHeader doc={doc} onClose={onClose} />
      <DetailInfo doc={doc} onStatusChange={onStatusChange} />
      <ConversationPanel documentId={doc.id} />
    </div>
  )
}

interface DetailHeaderProps {
  doc: TrackedDoc
  onClose: () => void
}

function DetailHeader({ doc, onClose }: DetailHeaderProps) {
  return (
    <div className="px-5 py-3 border-b flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold truncate">{doc.title}</h2>
        {doc.receiver && <p className="text-xs text-muted-foreground">→ {doc.receiver.name}</p>}
      </div>
      <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

interface DetailInfoProps {
  doc: TrackedDoc
  onStatusChange: () => void
}

function DetailInfo({ doc, onStatusChange }: DetailInfoProps) {
  return (
    <div className="px-5 py-4 border-b space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <DocumentStatusBadge status={doc.status} />
        <Badge variant="secondary" className="text-[10px]">
          {doc.requiresSignature ? "Firma requerida" : "Solo lectura"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground">Enviado</p>
          <p className="font-medium">
            {new Date(doc.createdAt).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Última actividad</p>
          <p className="font-medium">{formatRelativeDate(doc.updatedAt)}</p>
        </div>
      </div>

      <StatusTimeline currentStatus={doc.status as DocumentStatus} />
      <ContextualActions
        documentId={doc.id}
        status={doc.status as DocumentStatus}
        onStatusChange={onStatusChange}
      />
    </div>
  )
}

interface StatusTimelineProps {
  currentStatus: DocumentStatus
}

const STEP_COLOR: Record<string, { badge: string; connector: string }> = {
  sent: { badge: "bg-blue-500 text-white hover:bg-blue-500", connector: "bg-blue-400" },
  viewed: { badge: "bg-violet-500 text-white hover:bg-violet-500", connector: "bg-violet-400" },
  in_review: { badge: "bg-amber-500 text-white hover:bg-amber-500", connector: "bg-amber-400" },
  signed: { badge: "bg-emerald-500 text-white hover:bg-emerald-500", connector: "bg-emerald-400" },
  completed: {
    badge: "bg-emerald-600 text-white hover:bg-emerald-600",
    connector: "bg-emerald-400",
  },
  rejected: { badge: "bg-red-500 text-white hover:bg-red-500", connector: "bg-red-400" },
  archived: { badge: "bg-gray-400 text-white hover:bg-gray-400", connector: "bg-gray-300" },
}

function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const reached = getReachedStatuses(currentStatus)
  const steps = getVisibleSteps(currentStatus)

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {steps.map((step, idx) => {
        const isReached = reached.includes(step.status)
        const isCurrent = step.status === currentStatus
        const isLast = idx === steps.length - 1
        const colors = STEP_COLOR[step.status]
        return (
          <div key={step.status} className="flex items-center gap-1.5">
            <Badge
              variant={isReached ? "default" : "secondary"}
              className={cn(
                "text-[10px] font-medium",
                isReached && colors?.badge,
                isCurrent && "ring-1 ring-offset-1 ring-current",
                isReached && !isCurrent && "opacity-60"
              )}
            >
              {step.label}
            </Badge>
            {!isLast && (
              <div
                className={cn(
                  "w-4 h-0.5 rounded-full",
                  isReached && colors ? colors.connector : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

interface ContextualActionsProps {
  documentId: string
  status: DocumentStatus
  onStatusChange: () => void
}

function ContextualActions({ documentId, status, onStatusChange }: ContextualActionsProps) {
  const [updateDocument, { loading }] = useMutation(UpdateDocumentDocument, {
    onCompleted: () => {
      toast.success("Estado actualizado")
      onStatusChange()
    },
    onError: (err) => toast.error(err.message),
  })

  const actions = STATUS_ACTIONS[status]
  if (!actions || actions.length === 0) return null

  const handleAction = (targetStatus: DocumentStatus) => {
    updateDocument({
      variables: { id: documentId, input: { status: targetStatus } },
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === DocumentStatus.InReview && (
        <Link
          href={`/hr/documents/${documentId}/edit`}
          className="inline-flex items-center gap-1.5 text-xs h-7 px-2.5 rounded-[min(var(--radius-md),12px)] border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Pencil className="size-3" />
          Editar documento
        </Link>
      )}
      {actions.map((action) => {
        const isDisabled = !action.targetStatus || loading
        return (
          <Button
            key={action.label}
            variant={action.variant ?? "outline"}
            size="sm"
            className="text-xs h-7"
            disabled={isDisabled}
            onClick={() => action.targetStatus && handleAction(action.targetStatus)}
          >
            <action.icon className="size-3 mr-1.5" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
