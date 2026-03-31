"use client"

import { useQuery } from "@apollo/client/react"
import { MessageSquare } from "lucide-react"
import { useMemo, useState } from "react"
import { GetDocumentsDocument } from "@/lib/apollo/generated/graphql"
import {
  ConversationItem,
  ListEmpty,
  ListHeader,
  ListSkeleton,
} from "./_components/conversation-list"
import { ConversationThread } from "./_components/conversation-thread"
import { type ConvoDoc, QUERY_TAB, type QueryTab } from "./_lib/queries.types"

const ATTENTION_STATUSES = ["in_review", "rejected"]

export default function HRQueriesPage() {
  const [tab, setTab] = useState<QueryTab>(QUERY_TAB.ATTENTION)
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, loading, refetch } = useQuery(GetDocumentsDocument)

  const clones = useMemo(() => {
    return (data?.getDocuments?.docs ?? []).filter((d) => d.originalDocumentId) as ConvoDoc[]
  }, [data])

  const displayed = useMemo(() => {
    const base =
      tab === QUERY_TAB.ATTENTION
        ? clones.filter((d) => ATTENTION_STATUSES.includes(d.status))
        : clones
    if (!search) return base
    const q = search.toLowerCase()
    return base.filter(
      (d) => d.title.toLowerCase().includes(q) || d.receiver?.name?.toLowerCase().includes(q)
    )
  }, [clones, tab, search])

  // Auto-seleccionar primero si no hay selección
  if (!selectedId && displayed.length > 0) {
    setSelectedId(displayed[0].id)
  }

  const selectedDoc = clones.find((d) => d.id === selectedId) ?? null
  const attentionCount = clones.filter((d) => ATTENTION_STATUSES.includes(d.status)).length

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* ── Panel izquierdo: lista ── */}
      <aside className="w-96 shrink-0 border-r flex flex-col bg-background">
        <ListHeader
          search={search}
          onSearchChange={setSearch}
          tab={tab}
          onTabChange={(v) => {
            setTab(v as QueryTab)
            setSelectedId(null) // reset para que auto-seleccione el primero del nuevo tab
          }}
          attentionCount={attentionCount}
          total={clones.length}
        />

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <ListSkeleton />
          ) : displayed.length === 0 ? (
            <ListEmpty tab={tab} />
          ) : (
            displayed.map((doc) => (
              <ConversationItem
                key={doc.id}
                doc={doc}
                isSelected={doc.id === selectedId}
                onClick={() => setSelectedId(doc.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Panel derecho: conversación ── */}
      {selectedDoc ? (
        <ConversationThread key={selectedDoc.id} doc={selectedDoc} onStatusChange={refetch} />
      ) : (
        <EmptyThread />
      )}
    </div>
  )
}

function EmptyThread() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-muted/10">
      <MessageSquare className="size-12 text-muted-foreground/15 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">Selecciona una conversación</p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        Elige un documento de la lista para ver sus observaciones
      </p>
    </div>
  )
}
