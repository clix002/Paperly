"use client"

import { useQuery } from "@apollo/client/react"
import { ArrowRight, FileText, GitPullRequestArrow, Plus } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { Label, Pie, PieChart } from "recharts"
import { AttentionList, filterAttentionDocs } from "@/components/hr/attention-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
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
  const clones = docs.filter((d) => d.originalDocumentId)

  return {
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

const chartConfig = {
  pending: { label: "Pendientes", color: "var(--color-amber-400)" },
  signed: { label: "Firmados", color: "var(--color-green-500)" },
  inReview: { label: "En revisión", color: "var(--color-orange-500)" },
} satisfies ChartConfig

interface StatsSectionProps {
  stats: Stats
}

function StatsSection({ stats }: StatsSectionProps) {
  const chartData = [
    { name: "pending", value: stats.pending, fill: "var(--color-amber-400)" },
    { name: "signed", value: stats.signed, fill: "var(--color-green-500)" },
    { name: "inReview", value: stats.inReview, fill: "var(--color-orange-500)" },
  ]

  const hasData = stats.sent > 0

  return (
    <Card>
      <CardContent className="flex items-center gap-6 p-4">
        {/* Donut chart */}
        <ChartContainer config={chartConfig} className="size-35 shrink-0">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={hasData ? chartData : [{ name: "empty", value: 1, fill: "var(--muted)" }]}
              dataKey="value"
              nameKey="name"
              innerRadius={42}
              outerRadius={62}
              strokeWidth={0}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {stats.sent}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 18}
                          className="fill-muted-foreground text-[10px]"
                        >
                          enviados
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend / stats */}
        <div className="flex-1 space-y-3">
          <StatRow
            color="bg-amber-400"
            label="Pendientes"
            value={stats.pending}
            total={stats.sent}
          />
          <StatRow color="bg-green-500" label="Firmados" value={stats.signed} total={stats.sent} />
          <StatRow
            color="bg-orange-500"
            label="En revisión"
            value={stats.inReview}
            total={stats.sent}
            highlight={stats.inReview > 0}
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface StatRowProps {
  color: string
  label: string
  value: number
  total: number
  highlight?: boolean
}

function StatRow({ color, label, value, total, highlight }: StatRowProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("size-2.5 rounded-full shrink-0", color)} />
      <span className={cn("text-sm flex-1", highlight && "font-medium text-orange-600")}>
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
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
