"use client"

import { FileText } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  hasFilters: boolean
  onClear: () => void
}

export function EmptyState({ hasFilters, onClear }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed mt-4">
        <FileText className="size-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground font-medium">No se encontraron documentos</p>
        <button
          type="button"
          onClick={onClear}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Limpiar búsqueda
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed mt-4">
      <FileText className="size-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground font-medium">No hay documentos</p>
      <Link href="/hr/documents/new" className="mt-2 text-sm text-primary hover:underline">
        Crear primer documento
      </Link>
    </div>
  )
}
