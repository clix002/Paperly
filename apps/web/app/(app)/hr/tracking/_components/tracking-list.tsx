"use client"

import { Archive, FileSignature, FileText } from "lucide-react"
import { WorkerAvatar } from "@/app/(app)/hr/queries/_components/worker-avatar"
import { DocumentStatusBadge } from "@/components/dashboard/document-status-badge"
import { Badge } from "@/components/ui/badge"
import { cn, formatRelativeDate } from "@/lib/utils"
import type { TrackedDoc } from "../_lib/tracking"

interface TrackingListProps {
  documents: TrackedDoc[]
  emptyCount: number
  selectedDocId: string | null
  onSelect: (id: string) => void
}

export function TrackingList({
  documents,
  emptyCount,
  selectedDocId,
  onSelect,
}: TrackingListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <Archive className="size-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          {emptyCount === 0 ? "No has enviado documentos aún" : "No hay documentos en este filtro"}
        </p>
      </div>
    )
  }

  return (
    <div className="p-2 space-y-1">
      {documents.map((doc) => (
        <TrackingListItem
          key={doc.id}
          doc={doc}
          isSelected={selectedDocId === doc.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

interface TrackingListItemProps {
  doc: TrackedDoc
  isSelected: boolean
  onSelect: (id: string) => void
}

export function TrackingListItem({ doc, isSelected, onSelect }: TrackingListItemProps) {
  const DocIcon = doc.requiresSignature ? FileSignature : FileText
  const iconColor = doc.requiresSignature ? "text-purple-600" : "text-blue-600"

  return (
    <button
      type="button"
      onClick={() => onSelect(doc.id)}
      className={cn(
        "w-full text-left rounded-lg p-3 transition-colors",
        isSelected ? "bg-primary/10" : "hover:bg-muted"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "rounded-lg p-1.5 shrink-0 mt-0.5",
            doc.requiresSignature ? "bg-purple-100" : "bg-blue-100"
          )}
        >
          <DocIcon className={cn("size-3.5", iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{doc.title}</p>
          {doc.receiver && (
            <div className="flex items-center gap-1.5 mt-1">
              <WorkerAvatar name={doc.receiver.name} size="xs" />
              <span className="text-xs text-muted-foreground truncate">{doc.receiver.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <DocumentStatusBadge status={doc.status} className="text-[10px]" />
            <Badge variant="secondary" className="text-[10px] tabular-nums">
              {formatRelativeDate(doc.updatedAt)}
            </Badge>
          </div>
        </div>
      </div>
    </button>
  )
}
