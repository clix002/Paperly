"use client"

import { Edit3, FileSignature, FileText, MoreHorizontal, Send, Trash2, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { DocumentStatusBadge } from "@/components/dashboard/document-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DocumentStatus } from "@/lib/apollo/generated/graphql"
import { cn, formatRelativeDate } from "@/lib/utils"
import type { OriginalDoc } from "../_lib/documents.utils"

interface DocumentRowProps {
  doc: OriginalDoc
  onDelete: () => void
  onSend: () => void
}

export function DocumentRow({ doc, onDelete, onSend }: DocumentRowProps) {
  const router = useRouter()
  const editUrl = `/hr/documents/${doc.id}/edit`
  const DocIcon = doc.requiresSignature ? FileSignature : FileText
  const iconColor = doc.requiresSignature ? "text-purple-600" : "text-blue-600"
  const iconBg = doc.requiresSignature ? "bg-purple-100" : "bg-blue-100"

  return (
    <Card className="p-4 transition-all hover:shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn("rounded-lg p-2.5 shrink-0", iconBg)}>
          <DocIcon className={cn("size-5", iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{doc.title}</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span>{formatRelativeDate(doc.createdAt)}</span>
            {doc.cloneCount > 0 && (
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                Enviado {doc.cloneCount} {doc.cloneCount === 1 ? "vez" : "veces"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="hidden sm:flex">
            {doc.requiresSignature ? "Firma" : "Lectura"}
          </Badge>
          <DocumentStatusBadge status={doc.status} />
        </div>

        {doc.status === DocumentStatus.Draft && (
          <Button size="sm" variant="outline" onClick={onSend} className="shrink-0 hidden sm:flex">
            <Send className="size-3.5 mr-1.5" />
            Enviar
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(editUrl)}>
              <Edit3 className="size-4 mr-2" />
              Editar
            </DropdownMenuItem>
            {doc.status === DocumentStatus.Draft && (
              <DropdownMenuItem onClick={onSend}>
                <Send className="size-4 mr-2" />
                Enviar a trabajadores
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="size-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
