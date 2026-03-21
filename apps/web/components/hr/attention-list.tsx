import { AlertTriangle, ArrowRight, FileText, MessageSquare } from "lucide-react"
import Link from "next/link"
import { DocumentStatusBadge } from "@/components/dashboard/document-status-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatRelativeDate } from "@/lib/utils"

type AttentionDoc = {
  id: string
  title: string
  status: string
  updatedAt: string
  receiver?: { id: string; name: string } | null
}

const ATTENTION_STATUSES = ["in_review", "rejected"]

export function filterAttentionDocs(
  docs: { status: string; originalDocumentId?: string | null }[]
): AttentionDoc[] {
  return docs.filter(
    (d) => d.originalDocumentId && ATTENTION_STATUSES.includes(d.status)
  ) as AttentionDoc[]
}

export function AttentionList({ documents }: { documents: AttentionDoc[] }) {
  if (documents.length === 0) {
    return <AttentionEmpty />
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-500" />
          <h2 className="font-semibold">Requiere atención</h2>
        </div>
        <Link href="/hr/tracking">
          <Button variant="ghost" size="sm" className="text-xs h-7">
            Ver seguimiento
            <ArrowRight className="size-3 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <AttentionItem key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  )
}

function AttentionItem({ doc }: { doc: AttentionDoc }) {
  return (
    <Link href={`/hr/tracking?doc=${doc.id}`}>
      <Card className="p-3 hover:shadow-sm transition-shadow cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-2 shrink-0">
            {doc.status === "in_review" ? (
              <MessageSquare className="size-4 text-amber-600" />
            ) : (
              <FileText className="size-4 text-red-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{doc.title}</p>
            {doc.receiver && (
              <p className="text-xs text-muted-foreground truncate">→ {doc.receiver.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DocumentStatusBadge status={doc.status} />
            <span className="text-[10px] text-muted-foreground">
              {formatRelativeDate(doc.updatedAt)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

function AttentionEmpty() {
  return (
    <Card className="p-6 text-center border-dashed">
      <p className="text-sm text-muted-foreground">
        Todo en orden — sin documentos que requieran atención
      </p>
    </Card>
  )
}
