"use client"

import { MessageSquare, Search } from "lucide-react"
import { DocumentStatusBadge } from "@/components/dashboard/document-status-badge"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, formatRelativeDate } from "@/lib/utils"
import { type ConvoDoc, QUERY_TAB, type QueryTab } from "../_lib/queries.types"
import { WorkerAvatar } from "./worker-avatar"

interface ListHeaderProps {
  search: string
  onSearchChange: (v: string) => void
  tab: QueryTab
  onTabChange: (v: string) => void
  attentionCount: number
  total: number
}

export function ListHeader({
  search,
  onSearchChange,
  tab,
  onTabChange,
  attentionCount,
  total,
}: ListHeaderProps) {
  return (
    <div className="p-4 border-b space-y-3 shrink-0">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg">Consultas</h1>
        <Badge variant="secondary">{total}</Badge>
      </div>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList variant="line">
          <TabsTrigger value={QUERY_TAB.ATTENTION}>
            Por atender
            {attentionCount > 0 && (
              <Badge className="ml-1.5 size-4 justify-center rounded-full bg-amber-500 text-white text-[9px] px-0 py-0">
                {attentionCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value={QUERY_TAB.ALL}>Todas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por título o trabajador..."
          className="pl-8 h-8 text-xs"
        />
      </div>
    </div>
  )
}

interface ConversationItemProps {
  doc: ConvoDoc
  isSelected: boolean
  onClick: () => void
}

export function ConversationItem({ doc, isSelected, onClick }: ConversationItemProps) {
  const needsAttention = ["in_review", "rejected"].includes(doc.status)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 border-b transition-colors",
        isSelected ? "bg-accent" : "hover:bg-accent/40"
      )}
    >
      <div className="flex items-start gap-3">
        <WorkerAvatar name={doc.receiver?.name} />

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate leading-tight">{doc.title}</span>
            <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
              {formatRelativeDate(doc.updatedAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground truncate">
              {doc.receiver?.name ?? "Sin asignar"}
            </span>
            <DocumentStatusBadge status={doc.status} className="shrink-0 text-[9px] py-0" />
          </div>
        </div>

        {needsAttention && <Badge className="size-2 rounded-full bg-amber-500 p-0 mt-2 shrink-0" />}
      </div>
    </button>
  )
}

export function ListSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton estático
        <div key={i} className="px-4 py-3.5 border-b flex items-start gap-3">
          <Skeleton className="size-9 rounded-full shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface ListEmptyProps {
  tab: string
}

export function ListEmpty({ tab }: ListEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
      <MessageSquare className="size-10 text-muted-foreground/20 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">
        {tab === QUERY_TAB.ATTENTION ? "Sin consultas pendientes" : "Sin conversaciones"}
      </p>
      <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px] leading-relaxed">
        {tab === QUERY_TAB.ATTENTION
          ? "Cuando un trabajador envíe una observación aparecerá aquí"
          : "Los documentos enviados a trabajadores aparecerán aquí"}
      </p>
    </div>
  )
}
