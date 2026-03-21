"use client"

import { ChevronRight, FileSignature, FileText, User } from "lucide-react"
import Link from "next/link"
import { DocumentStatus } from "@/lib/apollo/generated/graphql"
import { cn, formatRelativeDate } from "@/lib/utils"
import { DocumentStatusBadge } from "./document-status-badge"

interface DocumentCardProps {
  document: {
    id: string
    title: string
    status: string
    requiresSignature: boolean
    createdAt: string
    updatedAt: string
    sender?: {
      id: string
      name: string
      image?: string | null
    } | null
  }
}

const PENDING_STATUSES = new Set([DocumentStatus.Sent, DocumentStatus.Viewed])

export function DocumentCard({ document: doc }: DocumentCardProps) {
  const needsAction = PENDING_STATUSES.has(doc.status as DocumentStatus)
  const DocIcon = doc.requiresSignature ? FileSignature : FileText
  const iconColor = doc.requiresSignature ? "text-purple-600" : "text-blue-600"

  return (
    <Link
      href={`/dashboard/documents/${doc.id}`}
      className={cn(
        "group flex items-center gap-4 px-4 py-3 transition-colors",
        "hover:bg-muted/50",
        needsAction && "border-l-3 border-l-amber-400 bg-amber-50/30"
      )}
    >
      <DocIcon className={cn("size-4 shrink-0", iconColor)} />

      <div className="flex-1 min-w-0 flex items-center gap-3">
        <span className={cn("text-sm truncate", needsAction && "font-medium")}>{doc.title}</span>
        <DocumentStatusBadge status={doc.status} className="shrink-0 text-[10px]" />
      </div>

      <div className="hidden md:flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <User className="size-3" />
          {doc.sender?.name ?? "Sistema"}
        </span>
        <span className="w-16 text-right tabular-nums">{formatRelativeDate(doc.createdAt)}</span>
      </div>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
    </Link>
  )
}
