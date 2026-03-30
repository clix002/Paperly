import { Archive, Check, CheckCircle2, Clock, Eye, FileText, Send, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  draft: {
    label: "Borrador",
    variant: "secondary",
    icon: FileText,
    color: "text-gray-500",
    bg: "bg-gray-300",
    step: 0,
  },
  sent: {
    label: "Enviado",
    variant: "outline",
    icon: Send,
    color: "text-blue-600",
    bg: "bg-blue-500",
    step: 1,
  },
  viewed: {
    label: "Visto",
    variant: "outline",
    icon: Eye,
    color: "text-violet-600",
    bg: "bg-violet-500",
    step: 2,
  },
  in_review: {
    label: "En revisión",
    variant: "outline",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-500",
    step: 2,
  },
  signed: {
    label: "Firmado",
    variant: "outline",
    icon: Check,
    color: "text-emerald-600",
    bg: "bg-emerald-500",
    step: 3,
  },
  rejected: {
    label: "Rechazado",
    variant: "destructive",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-500",
    step: 2,
  },
  completed: {
    label: "Completado",
    variant: "default",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-500",
    step: 4,
  },
  archived: {
    label: "Archivado",
    variant: "secondary",
    icon: Archive,
    color: "text-gray-500",
    bg: "bg-gray-400",
    step: 4,
  },
} as const

type Status = keyof typeof STATUS_CONFIG

function getConfig(status: string) {
  return STATUS_CONFIG[status as Status] ?? STATUS_CONFIG.draft
}

export function DocumentStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = getConfig(status)
  const Icon = config.icon

  return (
    <Badge
      data-slot="document-status-badge"
      variant={config.variant}
      className={cn("gap-1", className)}
    >
      <Icon className={cn("size-3", config.color)} />
      {config.label}
    </Badge>
  )
}

export function getStatusStep(status: string): number {
  return getConfig(status).step
}

export function getStatusColor(status: string): string {
  return getConfig(status).bg
}
