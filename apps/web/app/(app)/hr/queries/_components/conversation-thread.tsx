"use client"

import { useMutation } from "@apollo/client/react"
import { Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { DocumentStatusBadge } from "@/components/dashboard/document-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useComments } from "@/hooks/use-comments"
import { UpdateDocumentDocument } from "@/lib/apollo/generated/graphql"
import { cn, formatRelativeDate } from "@/lib/utils"
import { type CommentType, type ConvoDoc, THREAD_ACTIONS } from "../_lib/queries.types"
import { WorkerAvatar } from "./worker-avatar"

interface ConversationThreadProps {
  doc: ConvoDoc
  onStatusChange: () => void
}

export function ConversationThread({ doc, onStatusChange }: ConversationThreadProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const {
    comments,
    loading: messagesLoading,
    sending,
    send,
    loadMore,
    loadingMore,
    hasMore,
  } = useComments(doc.id)

  const [updateDocument, { loading: updating }] = useMutation(UpdateDocumentDocument, {
    onCompleted: () => {
      toast.success("Estado actualizado")
      onStatusChange()
    },
    onError: (err) => toast.error(err.message),
  })

  const action = THREAD_ACTIONS[doc.status]

  const handleSend = () => {
    send(message)
    setMessage("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <WorkerAvatar name={doc.receiver?.name} size="lg" />
            <div className="min-w-0">
              <h2 className="font-semibold text-base truncate leading-tight">{doc.title}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {doc.receiver?.name ?? "Sin asignar"}
                </span>
                <DocumentStatusBadge status={doc.status} />
                <Badge variant="secondary" className="text-[10px]">
                  {doc.requiresSignature ? "Requiere firma" : "Solo lectura"}
                </Badge>
              </div>
            </div>
          </div>

          {action && (
            <Button
              size="sm"
              variant={action.variant}
              onClick={() =>
                updateDocument({ variables: { id: doc.id, input: { status: action.target } } })
              }
              disabled={updating}
              className="shrink-0"
            >
              {updating ? (
                <Spinner className="size-3.5 mr-1.5" />
              ) : (
                <action.icon className="size-3.5 mr-1.5" />
              )}
              {action.label}
            </Button>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <MessageList
        comments={comments as CommentType[]}
        loading={messagesLoading}
        loadMore={loadMore}
        loadingMore={loadingMore}
        hasMore={hasMore}
      />

      {/* Input */}
      <div className="px-6 py-4 border-t bg-background shrink-0">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Escribe una respuesta..."
            disabled={sending}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={!message.trim() || sending}>
            {sending ? <Spinner className="size-4" /> : <Send className="size-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}

interface MessageListProps {
  comments: CommentType[]
  loading: boolean
  loadMore: () => void
  loadingMore: boolean
  hasMore: boolean
}

function MessageList({ comments, loading, loadMore, loadingMore, hasMore }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastIdRef = useRef<string | null>(null)

  const lastId = comments[comments.length - 1]?.id ?? null

  useEffect(() => {
    if (lastId && lastId !== lastIdRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      lastIdRef.current = lastId
    }
  }, [lastId])

  const handleScroll = () => {
    if (containerRef.current && containerRef.current.scrollTop === 0 && hasMore) {
      loadMore()
    }
  }

  if (loading) return <MessageSkeleton />

  if (comments.length === 0) return <MessagesEmpty />

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [&::-webkit-scrollbar]:hidden"
    >
      {loadingMore && (
        <div className="flex justify-center py-2">
          <Spinner className="size-4" />
        </div>
      )}
      {comments.map((c) => (
        <MessageBubble key={c.id} comment={c} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

interface MessageBubbleProps {
  comment: CommentType
}

function MessageBubble({ comment }: MessageBubbleProps) {
  const isHR = comment.author?.role === "hr"

  return (
    <div className={cn("flex gap-3", isHR ? "flex-row-reverse" : "flex-row")}>
      <WorkerAvatar name={comment.author?.name} isHR={isHR} />
      <div className={cn("max-w-[70%] space-y-1", isHR && "items-end flex flex-col")}>
        <div className={cn("flex items-center gap-1.5 text-[10px]", isHR && "flex-row-reverse")}>
          <span className="font-medium">{comment.author?.name}</span>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 leading-tight">
            {isHR ? "RR.HH." : "Trabajador"}
          </Badge>
        </div>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed wrap-break-word",
            isHR
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-muted text-foreground"
          )}
        >
          {comment.content}
        </div>
        <p className="text-[10px] text-muted-foreground">{formatRelativeDate(comment.createdAt)}</p>
      </div>
    </div>
  )
}

interface SkeletonBubbleProps {
  align: "left" | "right"
}

function SkeletonBubble({ align }: SkeletonBubbleProps) {
  return (
    <div className={cn("flex gap-3 max-w-[70%]", align === "right" && "ml-auto flex-row-reverse")}>
      <Skeleton className="size-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-14 rounded-2xl" />
      </div>
    </div>
  )
}

function MessageSkeleton() {
  return (
    <div className="flex-1 px-6 py-5 space-y-5">
      <SkeletonBubble align="left" />
      <SkeletonBubble align="right" />
      <SkeletonBubble align="left" />
    </div>
  )
}

function MessagesEmpty() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <Send className="size-10 text-muted-foreground/15 mb-3" />
      <p className="text-sm text-muted-foreground">Sin mensajes aún</p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        El trabajador aún no ha enviado observaciones para este documento
      </p>
    </div>
  )
}
