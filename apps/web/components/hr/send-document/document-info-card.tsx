"use client"

import { Calendar, FileSignature, FileText, Users, X } from "lucide-react"
import { DocumentStatusBadge } from "@/components/dashboard/document-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatRelativeDate } from "@/lib/utils"
import type { SendTarget } from "./types"

interface PanelHeaderProps {
  target: SendTarget
  onClose: () => void
}

export function PanelHeader({ target, onClose }: PanelHeaderProps) {
  return (
    <div className="px-5 py-3 border-b flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">Enviar documento</p>
        <h2 className="text-sm font-semibold truncate">{target.title}</h2>
      </div>
      <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

interface DocumentInfoCardProps {
  target: SendTarget
}

export function DocumentInfoCard({ target }: DocumentInfoCardProps) {
  const DocIcon = target.requiresSignature ? FileSignature : FileText
  const iconColor = target.requiresSignature ? "text-purple-600" : "text-blue-600"

  return (
    <div className="px-5 py-4 border-b space-y-3">
      <div className="flex items-center gap-3">
        <div className={cn("rounded-lg bg-muted p-2 shrink-0")}>
          <DocIcon className={cn("size-4", iconColor)} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DocumentStatusBadge status={target.status} />
          <Badge variant="secondary" className="text-[10px]">
            {target.requiresSignature ? "Firma requerida" : "Solo lectura"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="size-3" />
          <span>Creado {formatRelativeDate(target.createdAt)}</span>
        </div>
        {target.cloneCount > 0 && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-3" />
            <span>
              Enviado {target.cloneCount} {target.cloneCount === 1 ? "vez" : "veces"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
