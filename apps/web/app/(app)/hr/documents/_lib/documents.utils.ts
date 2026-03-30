import { DocumentStatus } from "@/lib/apollo/generated/graphql"

export type RawDoc = {
  id: string
  title: string
  status: string
  requiresSignature: boolean
  originalDocumentId?: string | null
  createdAt: string
  updatedAt: string
  sender?: { id: string; name: string } | null
  receiver?: { id: string; name: string } | null
}

export type OriginalDoc = RawDoc & {
  cloneCount: number
  sentReceiverIds: string[]
}

export const TABS = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Borradores" },
  { value: "signature", label: "Con firma" },
  { value: "readonly", label: "Solo lectura" },
] as const

export function buildOriginals(allDocs: RawDoc[]): OriginalDoc[] {
  const originals = allDocs.filter((d) => !d.originalDocumentId)
  const clonesByOriginal = new Map<string, RawDoc[]>()

  for (const doc of allDocs) {
    if (!doc.originalDocumentId) continue
    const list = clonesByOriginal.get(doc.originalDocumentId) ?? []
    list.push(doc)
    clonesByOriginal.set(doc.originalDocumentId, list)
  }

  return originals.map((doc) => {
    const clones = clonesByOriginal.get(doc.id) ?? []
    const receiverIds = clones.map((c) => c.receiver?.id).filter((id): id is string => !!id)

    return {
      ...doc,
      cloneCount: clones.length,
      sentReceiverIds: receiverIds,
    }
  })
}

export function filterOriginals(docs: OriginalDoc[], tab: string, search: string): OriginalDoc[] {
  return docs.filter((doc) => {
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) return false
    if (tab === "all") return true
    if (tab === "draft") return doc.status === DocumentStatus.Draft
    if (tab === "signature") return doc.requiresSignature
    if (tab === "readonly") return !doc.requiresSignature
    return true
  })
}

export function computeCounts(docs: OriginalDoc[]) {
  return {
    all: docs.length,
    draft: docs.filter((d) => d.status === DocumentStatus.Draft).length,
    signature: docs.filter((d) => d.requiresSignature).length,
    readonly: docs.filter((d) => !d.requiresSignature).length,
  }
}
