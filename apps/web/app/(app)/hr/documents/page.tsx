"use client"

import { useMutation, useQuery } from "@apollo/client/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { SendDocumentPanel } from "@/components/hr/send-document-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteDocumentDocument, GetDocumentsDocument } from "@/lib/apollo/generated/graphql"
import { cn } from "@/lib/utils"
import { CompactDocumentList } from "./_components/compact-document-list"
import { DocumentListHeader } from "./_components/document-list-header"
import { DocumentRow } from "./_components/document-row"
import { EmptyState } from "./_components/empty-state"
import {
  buildOriginals,
  computeCounts,
  filterOriginals,
  type RawDoc,
  TABS,
} from "./_lib/documents.utils"

const PAGE_LIMIT = 20

export default function HRDocumentsPage() {
  const [filters, setFilters] = useState({ search: "", tab: "all" })
  const [sendTargetId, setSendTargetId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const { data, loading, refetch } = useQuery(GetDocumentsDocument, {
    variables: { options: { limit: PAGE_LIMIT, page } },
  })
  const [deleteDocument] = useMutation(DeleteDocumentDocument, {
    onCompleted: () => {
      toast.success("Eliminado")
      refetch()
    },
    onError: (err) => toast.error(err.message),
  })

  const paginationInfo = data?.getDocuments?.info
  const allDocs = (data?.getDocuments?.docs ?? []) as RawDoc[]
  const originals = useMemo(() => buildOriginals(allDocs), [allDocs])
  const filtered = useMemo(
    () => filterOriginals(originals, filters.tab, filters.search),
    [originals, filters]
  )
  const counts = useMemo(() => computeCounts(originals), [originals])

  const sendTarget = sendTargetId ? originals.find((d) => d.id === sendTargetId) : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 min-h-0">
      {/* Left panel: document list */}
      <div
        className={cn(
          "flex flex-col bg-background",
          sendTarget ? "w-105 shrink-0 border-r" : "flex-1 max-w-5xl mx-auto border-x"
        )}
      >
        <DocumentListHeader
          count={originals.length}
          compact={!!sendTarget}
          search={filters.search}
          onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
        />

        <div className="flex-1 overflow-y-auto">
          {sendTarget ? (
            <CompactDocumentList
              documents={filtered}
              selectedDocId={sendTargetId}
              onSelect={setSendTargetId}
            />
          ) : (
            <div className="p-6 pt-0">
              <Tabs
                defaultValue="all"
                onValueChange={(tab) => setFilters((prev) => ({ ...prev, tab }))}
              >
                <TabsList variant="line">
                  {TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                      <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                        {counts[tab.value]}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {TABS.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value}>
                    {filtered.length === 0 ? (
                      <EmptyState
                        hasFilters={!!filters.search}
                        onClear={() => setFilters({ search: "", tab: filters.tab })}
                      />
                    ) : (
                      <div className="grid gap-3 mt-4">
                        {filtered.map((doc) => (
                          <DocumentRow
                            key={doc.id}
                            doc={doc}
                            onDelete={() => deleteDocument({ variables: { id: doc.id } })}
                            onSend={() => setSendTargetId(doc.id)}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>

              {paginationInfo && paginationInfo.totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-2 py-3 mt-2">
                  <span className="text-xs text-muted-foreground">
                    Página {paginationInfo.page} de {paginationInfo.totalPages} (
                    {paginationInfo.totalDocs} docs)
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      disabled={!paginationInfo.hasPrevPage}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      disabled={!paginationInfo.hasNextPage}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: send */}
      {sendTarget && (
        <SendDocumentPanel
          target={{
            id: sendTarget.id,
            title: sendTarget.title,
            status: sendTarget.status,
            requiresSignature: sendTarget.requiresSignature,
            cloneCount: sendTarget.cloneCount,
            sentReceiverIds: sendTarget.sentReceiverIds,
            createdAt: sendTarget.createdAt,
          }}
          onClose={() => setSendTargetId(null)}
          onSent={() => refetch()}
        />
      )}
    </div>
  )
}
