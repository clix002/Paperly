import { FileSignature, FileText } from "lucide-react"
import { WorkerAvatar } from "@/app/(app)/hr/queries/_components/worker-avatar"
import { Badge } from "@/components/ui/badge"
import { DocumentStatus } from "@/lib/apollo/generated/graphql"
import { cn, formatRelativeDate } from "@/lib/utils"

type TrackedDoc = {
  id: string
  title: string
  status: string
  requiresSignature: boolean
  createdAt: string
  updatedAt: string
  receiver?: { id: string; name: string } | null
}

type KanbanColumn = {
  status: DocumentStatus
  label: string
  headerBadge: string
  laneBg: string
  emptyBorder: string
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    status: DocumentStatus.Sent,
    label: "Enviados",
    headerBadge: "bg-blue-500 text-white",
    laneBg: "bg-blue-50/80 dark:bg-blue-950/30",
    emptyBorder: "border-blue-200/40 dark:border-blue-800/40",
  },
  {
    status: DocumentStatus.Viewed,
    label: "Vistos",
    headerBadge: "bg-violet-500 text-white",
    laneBg: "bg-violet-50/80 dark:bg-violet-950/30",
    emptyBorder: "border-violet-200/40 dark:border-violet-800/40",
  },
  {
    status: DocumentStatus.InReview,
    label: "En revisión",
    headerBadge: "bg-amber-500 text-white",
    laneBg: "bg-amber-50/80 dark:bg-amber-950/30",
    emptyBorder: "border-amber-200/40 dark:border-amber-800/40",
  },
  {
    status: DocumentStatus.Signed,
    label: "Firmados",
    headerBadge: "bg-emerald-500 text-white",
    laneBg: "bg-emerald-50/80 dark:bg-emerald-950/30",
    emptyBorder: "border-emerald-200/40 dark:border-emerald-800/40",
  },
]

interface TrackingKanbanProps {
  documents: TrackedDoc[]
  selectedDocId: string | null
  onSelect: (docId: string) => void
}

export function TrackingKanban({ documents, selectedDocId, onSelect }: TrackingKanbanProps) {
  return (
    <div className="grid grid-cols-4 gap-3 p-4 h-full">
      {KANBAN_COLUMNS.map((column) => {
        const columnDocs = documents.filter((d) => d.status === column.status)
        return (
          <KanbanLane
            key={column.status}
            column={column}
            documents={columnDocs}
            selectedDocId={selectedDocId}
            onSelect={onSelect}
          />
        )
      })}
    </div>
  )
}

interface KanbanLaneProps {
  column: KanbanColumn
  documents: TrackedDoc[]
  selectedDocId: string | null
  onSelect: (docId: string) => void
}

function KanbanLane({ column, documents, selectedDocId, onSelect }: KanbanLaneProps) {
  return (
    <div className={cn("flex flex-col min-w-0 rounded-xl p-2.5", column.laneBg)}>
      <div className="flex items-center gap-2 px-1 mb-2">
        <Badge className={cn("text-[10px] px-2 py-0.5 font-semibold", column.headerBadge)}>
          {column.label}
        </Badge>
        <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
          {documents.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {documents.length === 0 ? (
          <div
            className={cn(
              "flex items-center justify-center py-10 border border-dashed rounded-lg",
              column.emptyBorder
            )}
          >
            <p className="text-[10px] text-muted-foreground/40">Sin documentos</p>
          </div>
        ) : (
          documents.map((doc) => (
            <KanbanCard
              key={doc.id}
              doc={doc}
              isSelected={selectedDocId === doc.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface KanbanCardProps {
  doc: TrackedDoc
  isSelected: boolean
  onSelect: (docId: string) => void
}

function KanbanCard({ doc, isSelected, onSelect }: KanbanCardProps) {
  const DocIcon = doc.requiresSignature ? FileSignature : FileText
  const iconColor = doc.requiresSignature ? "text-purple-600" : "text-blue-600"

  return (
    <button
      type="button"
      className={cn(
        "w-full text-left rounded-lg border bg-background/90 p-2.5 transition-all",
        "hover:bg-background hover:shadow-sm",
        isSelected ? "ring-2 ring-primary shadow-sm bg-background" : "border-border/40"
      )}
      onClick={() => onSelect(doc.id)}
    >
      <div className="flex items-center gap-2">
        <DocIcon className={cn("size-3.5 shrink-0", iconColor)} />
        <p className="text-xs font-medium truncate flex-1">{doc.title}</p>
      </div>

      <div className="flex items-center justify-between mt-2">
        {doc.receiver ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <WorkerAvatar name={doc.receiver.name} size="xs" />
            <span className="text-[10px] text-muted-foreground truncate">{doc.receiver.name}</span>
          </div>
        ) : (
          <span />
        )}
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 shrink-0">
          {doc.requiresSignature ? "Firma" : "Lectura"}
        </Badge>
      </div>

      <Badge variant="secondary" className="text-[9px] mt-1.5 tabular-nums w-fit">
        {formatRelativeDate(doc.updatedAt)}
      </Badge>
    </button>
  )
}
