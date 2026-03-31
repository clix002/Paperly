"use client"

import { useMutation, useQuery, useSubscription } from "@apollo/client/react"
import { toast } from "sonner"
import {
  CreateCommentDocument,
  GetCommentsByDocumentDocument,
  OnCommentAddedDocument,
} from "@/lib/apollo/generated/graphql"

export function useComments(documentId: string) {
  const { data, loading } = useQuery(GetCommentsByDocumentDocument, {
    variables: { documentId },
  })

  useSubscription(OnCommentAddedDocument, {
    variables: { documentId },
    onError: (err) => console.error("[subscription] error", err),
    onData: ({ client, data: subData }) => {
      console.log("[subscription] data received", subData)
      const newComment = subData.data?.commentAdded
      if (!newComment) return
      client.cache.updateQuery(
        { query: GetCommentsByDocumentDocument, variables: { documentId } },
        (prev) => {
          const existing = prev?.getCommentsByDocument ?? []
          if (existing.some((c: { id: string }) => c.id === newComment.id)) return prev
          return { getCommentsByDocument: [...existing, newComment] }
        }
      )
    },
  })

  const [createComment, { loading: sending }] = useMutation(CreateCommentDocument, {
    onError: (err) => toast.error(err.message),
    update(cache, { data: mutData }) {
      const newComment = mutData?.createComment
      if (!newComment) return
      cache.updateQuery(
        { query: GetCommentsByDocumentDocument, variables: { documentId } },
        (prev) => {
          const existing = prev?.getCommentsByDocument ?? []
          if (existing.some((c: { id: string }) => c.id === newComment.id)) return prev
          return { getCommentsByDocument: [...existing, newComment] }
        }
      )
    },
  })

  const comments = data?.getCommentsByDocument ?? []

  const send = (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return
    createComment({ variables: { documentId, content: trimmed } })
  }

  return { comments, loading, sending, send }
}
