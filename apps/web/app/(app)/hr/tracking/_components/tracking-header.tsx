"use client"

import { Kanban, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { TABS, VIEW_MODE, type ViewMode } from "../_lib/tracking"

interface TrackingHeaderProps {
  totalCount: number
  tabCounts: Record<string, number>
  onTabChange: (tab: string) => void
  search: string
  onSearchChange: (search: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  compact: boolean
}

export function TrackingHeader({
  totalCount,
  tabCounts,
  onTabChange,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  compact,
}: TrackingHeaderProps) {
  return (
    <div className="px-4 py-3.5 border-b space-y-3 shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-lg">Seguimiento</h1>
          <p className="text-xs text-muted-foreground">{totalCount} documentos enviados</p>
        </div>
        {!compact && <ViewToggle current={viewMode} onChange={onViewModeChange} />}
      </div>

      <Tabs defaultValue="all" onValueChange={onTabChange}>
        <TabsList variant="line" className="w-full">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="flex-1 min-w-0">
              {compact ? tab.shortLabel : tab.label}
              {!compact && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 shrink-0">
                  {tabCounts[tab.key] ?? 0}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Input
        placeholder="Buscar por título o trabajador..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 text-xs"
      />
    </div>
  )
}

interface ViewToggleProps {
  current: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ current, onChange }: ViewToggleProps) {
  return (
    <div className="flex border rounded-md">
      <button
        type="button"
        onClick={() => onChange(VIEW_MODE.LIST)}
        className={cn(
          "p-1.5 rounded-l-md transition-colors",
          current === VIEW_MODE.LIST
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange(VIEW_MODE.KANBAN)}
        className={cn(
          "p-1.5 rounded-r-md transition-colors",
          current === VIEW_MODE.KANBAN
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Kanban className="size-4" />
      </button>
    </div>
  )
}
