"use client"

import { useQuery } from "@apollo/client/react"
import {
  ArrowRight,
  BarChart3,
  Eye,
  FileText,
  GitPullRequestArrow,
  MessageSquare,
  Plus,
  Send,
} from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { AttentionList, filterAttentionDocs } from "@/components/hr/attention-list"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { DocumentStatus, GetDocumentsDocument } from "@/lib/apollo/generated/graphql"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type RawDoc = {
  id: string
  status: string
  originalDocumentId?: string | null
  title: string
  updatedAt: string
  receiver?: { id: string; name: string } | null
}

function computeStats(docs: RawDoc[]) {
  const originals = docs.filter((d) => !d.originalDocumentId)
  const clones = docs.filter((d) => d.originalDocumentId)

  return {
    created: originals.length,
    sent: clones.length,
    pending: clones.filter((d) =>
      [DocumentStatus.Sent, DocumentStatus.Viewed].includes(d.status as DocumentStatus)
    ).length,
    signed: clones.filter((d) =>
      [DocumentStatus.Signed, DocumentStatus.Completed].includes(d.status as DocumentStatus)
    ).length,
    inReview: clones.filter((d) => d.status === DocumentStatus.InReview).length,
  }
}

type Stats = ReturnType<typeof computeStats>

export default function HRDashboardPage() {
  const { data: session, isPending } = useSession()
  const { data } = useQuery(GetDocumentsDocument, { skip: isPending })

  const docs = useMemo(() => (data?.getDocuments?.docs ?? []) as RawDoc[], [data])
  const stats = useMemo(() => computeStats(docs), [docs])
  const attentionDocs = useMemo(() => filterAttentionDocs(docs), [docs])

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="size-8" />
      </div>
    )
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? ""

  return (
    <div className="flex-1 overflow-auto p-5 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hola, {firstName}</h1>
          <p className="text-sm text-muted-foreground">Panel de Recursos Humanos</p>
        </div>
        <Link href="/hr/documents/new">
          <Button>
            <Plus className="size-4 mr-1" />
            Nuevo documento
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StatsSection stats={stats} />
          <AttentionList documents={attentionDocs} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

interface StatsSectionProps {
  stats: Stats
}

function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Documentos creados"
          value={stats.created}
          icon={FileText}
          color="text-blue-600 bg-blue-100"
        />
        <StatCard
          label="Total enviados"
          value={stats.sent}
          icon={Send}
          color="text-violet-600 bg-violet-100"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Pendientes"
          value={stats.pending}
          icon={Eye}
          color="text-amber-600 bg-amber-100"
          compact
        />
        <StatCard
          label="Firmados"
          value={stats.signed}
          icon={BarChart3}
          color="text-green-600 bg-green-100"
          compact
        />
        <StatCard
          label="En revisión"
          value={stats.inReview}
          icon={MessageSquare}
          color="text-amber-600 bg-amber-100"
          compact
          highlight={stats.inReview > 0}
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: typeof FileText
  color: string
  compact?: boolean
  highlight?: boolean
}

function StatCard({ label, value, icon: Icon, color, compact, highlight }: StatCardProps) {
  return (
    <Card
      className={cn(compact ? "p-3" : "p-4", highlight && "ring-1 ring-amber-200 bg-amber-50/30")}
    >
      <div className="flex items-center gap-3">
        <div className={cn("rounded-lg shrink-0", compact ? "p-1.5" : "p-2", color)}>
          <Icon className={compact ? "size-4" : "size-5"} />
        </div>
        <div>
          <p className={cn("font-bold tabular-nums", compact ? "text-xl" : "text-2xl")}>{value}</p>
          <p className={cn("text-muted-foreground", compact ? "text-[11px]" : "text-xs")}>
            {label}
          </p>
        </div>
      </div>
    </Card>
  )
}

const ACTIONS = [
  {
    title: "Nuevo documento",
    description: "Crear con el editor",
    icon: Plus,
    href: "/hr/documents/new",
    color: "text-blue-600",
  },
  {
    title: "Mis documentos",
    description: "Gestionar y enviar",
    icon: FileText,
    href: "/hr/documents",
    color: "text-green-600",
  },
  {
    title: "Seguimiento",
    description: "Estado de enviados",
    icon: GitPullRequestArrow,
    href: "/hr/tracking",
    color: "text-orange-600",
  },
] as const

function QuickActions() {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Acceso rápido</h3>
      <div className="space-y-1">
        {ACTIONS.map((action) => (
          <QuickActionItem key={action.href} action={action} />
        ))}
      </div>
    </Card>
  )
}

interface QuickActionItemProps {
  action: (typeof ACTIONS)[number]
}

function QuickActionItem({ action }: QuickActionItemProps) {
  return (
    <Link href={action.href}>
      <div className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted transition-colors group">
        <div className={cn("shrink-0", action.color)}>
          <action.icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{action.title}</p>
          <p className="text-[11px] text-muted-foreground">{action.description}</p>
        </div>
        <ArrowRight className="size-3.5 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    </Link>
  )
}
