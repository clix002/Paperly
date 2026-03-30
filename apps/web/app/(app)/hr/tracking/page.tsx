"use client"

import { useQuery } from "@apollo/client/react"
import { useSearchParams } from "next/navigation"
import { Suspense, useMemo, useState } from "react"
import { TrackingKanban } from "@/components/hr/tracking-kanban"
import { Spinner } from "@/components/ui/spinner"
import { type DocumentStatus, GetDocumentsDocument } from "@/lib/apollo/generated/graphql"
import { cn } from "@/lib/utils"
import { DetailPanel } from "./_components/detail-panel"
import { TrackingHeader } from "./_components/tracking-header"
import { TrackingList } from "./_components/tracking-list"
import {
  filterBySearch,
  filterByTab,
  TABS,
  type TrackedDoc,
  VIEW_MODE,
  type ViewMode,
} from "./_lib/tracking"

export default function HRTrackingPage() {
  return (
    <Suspense>
      <HRTrackingContent />
    </Suspense>
  )
}

function HRTrackingContent() {
  const searchParams = useSearchParams()
  const docParam = searchParams.get("doc")

  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedDocId, setSelectedDocId] = useState<string | null>(docParam)
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.LIST)

  const { data, loading, refetch } = useQuery(GetDocumentsDocument)

  const clones = useMemo(
    () => (data?.getDocuments?.docs ?? []).filter((d) => d.originalDocumentId) as TrackedDoc[],
    [data]
  )

  const filtered = useMemo(
    () => filterBySearch(filterByTab(clones, activeTab), search),
    [clones, activeTab, search]
  )

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: clones.length }
    for (const tab of TABS) {
      const { statuses } = tab
      if (statuses) {
        counts[tab.key] = clones.filter((d) => statuses.includes(d.status as DocumentStatus)).length
      }
    }
    return counts
  }, [clones])

  const selectedDoc = clones.find((d) => d.id === selectedDocId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 min-h-0">
      {/* Left panel: list or kanban */}
      <div
        className={cn(
          "flex flex-col border-r bg-background overflow-hidden",
          selectedDoc ? "w-96 shrink-0" : "flex-1 max-w-5xl mx-auto border-x"
        )}
      >
        <TrackingHeader
          totalCount={clones.length}
          tabCounts={tabCounts}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          viewMode={selectedDoc ? VIEW_MODE.LIST : viewMode}
          onViewModeChange={setViewMode}
          compact={!!selectedDoc}
        />

        <div className="flex-1 overflow-y-auto">
          {!selectedDoc && viewMode === VIEW_MODE.KANBAN ? (
            <TrackingKanban
              documents={filtered}
              selectedDocId={selectedDocId}
              onSelect={setSelectedDocId}
            />
          ) : (
            <TrackingList
              documents={filtered}
              emptyCount={clones.length}
              selectedDocId={selectedDocId}
              onSelect={setSelectedDocId}
            />
          )}
        </div>
      </div>

      {/* Right panel: detail */}
      {selectedDoc && (
        <DetailPanel
          doc={selectedDoc}
          onClose={() => setSelectedDocId(null)}
          onStatusChange={refetch}
        />
      )}
    </div>
  )
}
