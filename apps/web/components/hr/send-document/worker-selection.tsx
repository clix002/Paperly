"use client"

import { Check, CheckCircle2, Search, User, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { Worker } from "./types"

interface WorkerSelectionProps {
  workers: Worker[]
  selectedIds: Set<string>
  alreadySentSet: Set<string>
  availableCount: number
  loading: boolean
  search: string
  onSearchChange: (value: string) => void
  onToggle: (id: string) => void
  onToggleAll: () => void
}

export function WorkerSelection({
  workers,
  selectedIds,
  alreadySentSet,
  availableCount,
  loading,
  search,
  onSearchChange,
  onToggle,
  onToggleAll,
}: WorkerSelectionProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Seleccionar trabajadores</h3>
          {availableCount > 0 && (
            <button
              type="button"
              onClick={onToggleAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Users className="size-3" />
              {selectedIds.size === availableCount ? "Ninguno" : "Todos"}
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {availableCount}
              </Badge>
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <WorkerList
          workers={workers}
          selectedIds={selectedIds}
          alreadySentSet={alreadySentSet}
          loading={loading}
          onToggle={onToggle}
        />
      </div>
    </div>
  )
}

interface WorkerListProps {
  workers: Worker[]
  selectedIds: Set<string>
  alreadySentSet: Set<string>
  loading: boolean
  onToggle: (id: string) => void
}

function WorkerList({ workers, selectedIds, alreadySentSet, loading, onToggle }: WorkerListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-5" />
      </div>
    )
  }

  if (workers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        No hay trabajadores registrados
      </p>
    )
  }

  return (
    <div className="space-y-1.5">
      {workers.map((worker) => (
        <WorkerCard
          key={worker.id}
          worker={worker}
          isSelected={selectedIds.has(worker.id)}
          alreadySent={alreadySentSet.has(worker.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

interface WorkerCardProps {
  worker: Worker
  isSelected: boolean
  alreadySent: boolean
  onToggle: (id: string) => void
}

function WorkerCard({ worker, isSelected, alreadySent, onToggle }: WorkerCardProps) {
  if (alreadySent) {
    return (
      <div className="flex items-center gap-3 rounded-lg p-2.5 opacity-50 cursor-not-allowed">
        <div className="flex items-center justify-center size-8 rounded-full shrink-0 bg-green-100 text-green-600">
          <CheckCircle2 className="size-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{worker.name}</p>
          <p className="text-xs text-muted-foreground truncate">{worker.email}</p>
        </div>
        <Badge variant="secondary" className="text-[10px] shrink-0">
          Ya enviado
        </Badge>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onToggle(worker.id)}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg p-2.5 transition-colors text-left",
        isSelected ? "bg-primary/10" : "hover:bg-muted"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center size-8 rounded-full shrink-0 transition-colors",
          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {isSelected ? <Check className="size-3.5" /> : <User className="size-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{worker.name}</p>
        <p className="text-xs text-muted-foreground truncate">{worker.email}</p>
      </div>
    </button>
  )
}
