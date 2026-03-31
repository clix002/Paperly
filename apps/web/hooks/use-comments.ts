"use client"

import { useLazyQuery, useMutation, useQuery, useSubscription } from "@apollo/client/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  CreateCommentDocument,
  GetCommentsByDocumentDocument,
  type GetCommentsByDocumentQuery,
  OnCommentAddedDocument,
} from "@/lib/apollo/generated/graphql"

type CommentItem = GetCommentsByDocumentQuery["getCommentsByDocument"]["docs"][number]

const PAGE_SIZE = 10

export function useComments(documentId: string) {
  const [allComments, setAllComments] = useState<CommentItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const initialized = useRef(false)

  const { data, loading } = useQuery(GetCommentsByDocumentDocument, {
    variables: { documentId, options: { limit: PAGE_SIZE, page: 1 } },
  })

  useEffect(() => {
    if (!data || initialized.current) return
    const { docs, info } = data.getCommentsByDocument
    setAllComments(docs)
    setPage(1)
    setHasMore(info.hasPrevPage || info.totalPages > 1)
    initialized.current = true
  }, [data])

  useSubscription(OnCommentAddedDocument, {
    variables: { documentId },
    onError: (err) => console.error("[subscription] error", err),
    onData: ({ data: subData }) => {
      const newComment = subData.data?.commentAdded
      if (!newComment) return
      setAllComments((prev) => {
        if (prev.some((c) => c.id === newComment.id)) return prev
        return [...prev, newComment]
      })
    },
  })

  const [fetchMore] = useLazyQuery(GetCommentsByDocumentDocument)

  const loadMore = () => {
    if (loadingMore || !hasMore) return
    const nextPage = page + 1
    setLoadingMore(true)
    fetchMore({ variables: { documentId, options: { limit: PAGE_SIZE, page: nextPage } } })
      .then((result) => {
        const { docs, info } = result.data?.getCommentsByDocument ?? { docs: [], info: null }
        setAllComments((prev) => [...docs, ...prev])
        setPage(nextPage)
        setHasMore(info?.hasNextPage ?? false)
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }

  const [createComment, { loading: sending }] = useMutation(CreateCommentDocument, {
    onError: (err) => toast.error(err.message),
  })

  const send = (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return
    createComment({ variables: { documentId, content: trimmed } })
  }

  return { comments: allComments, loading, sending, send, loadMore, loadingMore, hasMore }
}
