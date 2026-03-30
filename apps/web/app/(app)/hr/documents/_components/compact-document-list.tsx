"use client"

import { FileSignature, FileText, Users } from "lucide-react"
import { DocumentStatusBadge } from "@/components/dashboard/document-status-badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DocumentStatus } from "@/lib/apollo/generated/graphql"
import { cn } from "@/lib/utils"
import type { OriginalDoc } from "../_lib/documents.utils"

interface CompactDocumentListProps {
  documents: OriginalDoc[]
  selectedDocId: string | null
  onSelect: (id: string) => void
}

export function CompactDocumentList({
  documents,
  selectedDocId,
  onSelect,
}: CompactDocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <FileText className="size-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No hay documentos</p>
      </div>
    )
  }

  return (
    <div className="p-2 space-y-1">
      {documents.map((doc) => {
        const DocIcon = doc.requiresSignature ? FileSignature : FileText
        const iconColor = doc.requiresSignature ? "text-purple-600" : "text-blue-600"
        const isSelected = selectedDocId === doc.id
        const isDraft = doc.status === DocumentStatus.Draft

        const btn = (
          <button
            key={doc.id}
            type="button"
            onClick={() => {
              if (isDraft) onSelect(doc.id)
            }}
            className={cn(
              "w-full text-left rounded-lg p-3 transition-colors",
              !isDraft && "opacity-40 cursor-not-allowed",
              isDraft && isSelected && "bg-primary/10",
              isDraft && !isSelected && "hover:bg-muted cursor-pointer"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-muted p-1.5 shrink-0 mt-0.5">
                <DocIcon className={cn("size-3.5", iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <DocumentStatusBadge status={doc.status} className="text-[10px]" />
                  {doc.cloneCount > 0 && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Users className="size-2.5" />
                      {doc.cloneCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        )

        if (!isDraft) {
          return (
            <Tooltip key={doc.id}>
              <TooltipTrigger render={<div />}>{btn}</TooltipTrigger>
              <TooltipContent>Solo documentos en borrador se pueden enviar</TooltipContent>
            </Tooltip>
          )
        }

        return btn
      })}
    </div>
  )
}
