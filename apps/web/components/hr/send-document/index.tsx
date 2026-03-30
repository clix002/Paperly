"use client"

import { useMutation, useQuery } from "@apollo/client/react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { GetUsersDocument, SendDocumentDocument } from "@/lib/apollo/generated/graphql"
import { DocumentInfoCard, PanelHeader } from "./document-info-card"
import { SendActionBar } from "./send-action-bar"
import type { SendDocumentPanelProps, Worker } from "./types"
import { WorkerSelection } from "./worker-selection"

export function SendDocumentPanel({ target, onClose, onSent }: SendDocumentPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState("")
  const [sendingCount, setSendingCount] = useState(0)

  const { data, loading } = useQuery(GetUsersDocument)
  const [sendDocument] = useMutation(SendDocumentDocument)

  const alreadySentSet = useMemo(() => new Set(target.sentReceiverIds), [target.sentReceiverIds])

  const { filtered, available } = useMemo(() => {
    const allWorkers = ((data?.users ?? []) as Worker[]).filter((u) => u.role === "worker")
    const q = search.toLowerCase()
    const list = q
      ? allWorkers.filter(
          (w) => w.name.toLowerCase().includes(q) || w.email.toLowerCase().includes(q)
        )
      : allWorkers
    return {
      filtered: list,
      available: list.filter((w) => !alreadySentSet.has(w.id)),
    }
  }, [data, search, alreadySentSet])

  const toggleWorker = (id: string) => {
    if (alreadySentSet.has(id)) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === available.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(available.map((w) => w.id)))
    }
  }

  const handleSend = async () => {
    if (selectedIds.size === 0) return
    setSendingCount(selectedIds.size)

    try {
      const promises = Array.from(selectedIds).map((receiverId) =>
        sendDocument({ variables: { id: target.id, receiverId } })
      )
      await Promise.all(promises)
      toast.success(
        selectedIds.size === 1
          ? "Documento enviado"
          : `Documento enviado a ${selectedIds.size} trabajadores`
      )
      setSelectedIds(new Set())
      setSearch("")
      setMessage("")
      onClose()
      onSent()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al enviar")
    } finally {
      setSendingCount(0)
    }
  }

  const isSending = sendingCount > 0

  return (
    <div className="flex-1 flex flex-col bg-background">
      <PanelHeader target={target} onClose={onClose} />
      <DocumentInfoCard target={target} />

      <WorkerSelection
        workers={filtered}
        selectedIds={selectedIds}
        alreadySentSet={alreadySentSet}
        availableCount={available.length}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        onToggle={toggleWorker}
        onToggleAll={toggleAll}
      />

      <SendActionBar
        selectedCount={selectedIds.size}
        isSending={isSending}
        message={message}
        onMessageChange={setMessage}
        onSend={handleSend}
        onCancel={onClose}
      />
    </div>
  )
}
