"use client"

import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DocumentListHeaderProps {
  count: number
  compact: boolean
  search: string
  onSearchChange: (value: string) => void
}

export function DocumentListHeader({
  count,
  compact,
  search,
  onSearchChange,
}: DocumentListHeaderProps) {
  return (
    <div className="p-5 pb-4 space-y-4 border-b">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={compact ? "text-lg font-bold" : "text-2xl font-bold"}>Documentos</h1>
          {!compact && (
            <p className="text-sm text-muted-foreground">
              {count} documento{count !== 1 ? "s" : ""} creado{count !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link href="/hr/documents/new">
          <Button size={compact ? "sm" : "default"}>
            <Plus className="size-4 mr-1.5" />
            {compact ? "Nuevo" : "Nuevo documento"}
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  )
}
