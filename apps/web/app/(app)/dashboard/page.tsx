"use client"

import { useQuery } from "@apollo/client/react"
import { FileText } from "lucide-react"
import { redirect } from "next/navigation"
import { useMemo, useState } from "react"
import { DocumentCard } from "@/components/dashboard/document-card"
import { SearchFilterBar } from "@/components/dashboard/search-filter-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { DocumentStatus, GetDocumentsByReceiverDocument } from "@/lib/apollo/generated/graphql"
import { useSession } from "@/lib/auth-client"
import { filterBySearchAndStatus } from "@/lib/utils"

const STATUS_MAP: Record<string, DocumentStatus[]> = {
  pending: [DocumentStatus.Sent, DocumentStatus.Viewed],
  in_review: [DocumentStatus.InReview],
  completed: [DocumentStatus.Signed, DocumentStatus.Completed, DocumentStatus.Archived],
}

const EMPTY_MESSAGES: Record<string, string> = {
  pending: "No tienes documentos pendientes",
  in_review: "No tienes documentos en revisión",
  completed: "No tienes documentos completados",
  all: "No tienes documentos",
}

function getEmptyMessage(search: string, status: string): string {
  if (search) return "No se encontraron documentos con esa búsqueda"
  return EMPTY_MESSAGES[status] ?? EMPTY_MESSAGES.all
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession()
  const role = (session?.user as { role?: string })?.role
  const isHR = !isPending && role === "hr"

  const [filters, setFilters] = useState({ search: "", status: "pending" })

  if (isHR) redirect("/hr")

  const { data, loading } = useQuery(GetDocumentsByReceiverDocument, {
    skip: isPending || isHR,
  })

  const documents = data?.getDocumentsByReceiver ?? []

  const filtered = useMemo(
    () => filterBySearchAndStatus(documents, filters.search, STATUS_MAP[filters.status]),
    [documents, filters]
  )

  const counts = useMemo(
    () => ({
      all: documents.length,
      pending: documents.filter((d) => STATUS_MAP.pending.includes(d.status)).length,
      in_review: documents.filter((d) => STATUS_MAP.in_review.includes(d.status)).length,
      completed: documents.filter((d) => STATUS_MAP.completed.includes(d.status)).length,
    }),
    [documents]
  )

  if (isPending || isHR) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-5 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Mis documentos</h1>
        <p className="text-sm text-muted-foreground">
          {counts.pending > 0
            ? `Tienes ${counts.pending} documento${counts.pending > 1 ? "s" : ""} pendiente${counts.pending > 1 ? "s" : ""}`
            : "No tienes documentos pendientes"}
        </p>
      </div>

      <SearchFilterBar
        search={filters.search}
        onSearchChange={(v) => setFilters((prev) => ({ ...prev, search: v }))}
        statusFilter={filters.status}
        onStatusFilterChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
        counts={counts}
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton estático
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="size-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            {getEmptyMessage(filters.search, filters.status)}
          </p>
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  )
}
