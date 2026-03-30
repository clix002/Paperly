"use client"

import { useMutation, useQuery } from "@apollo/client/react"
import { MessageSquare, Send, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  CreateCommentDocument,
  GetCommentsByDocumentDocument,
} from "@/lib/apollo/generated/graphql"
import { cn, formatRelativeDate, getInitials } from "@/lib/utils"

type Comment = {
  id: string
  content: string
  createdAt: string
  author?: { id: string; name: string; role: string } | null
}

interface CommentsSidebarProps {
  documentId: string
  onClose: () => void
}

interface SidebarMessagesProps {
  comments: Comment[]
  loading: boolean
}

interface SidebarMessageBubbleProps {
  comment: Comment
}

interface SidebarMessageSkeletonProps {
  align: "left" | "right"
}

interface CommentAvatarProps {
  name?: string | null
  isHR: boolean
}

export function CommentsSidebar({ documentId, onClose }: CommentsSidebarProps) {
  const [message, setMessage] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data, loading, refetch } = useQuery(GetCommentsByDocumentDocument, {
    variables: { documentId },
  })

  const [createComment, { loading: sending }] = useMutation(CreateCommentDocument, {
    onCompleted: () => {
      setMessage("")
      refetch()
    },
    onError: (err) => toast.error(err.message),
  })

  const comments = (data?.getCommentsByDocument ?? []) as Comment[]

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll al llegar nuevos mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [comments.length])

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed) return
    createComment({ variables: { documentId, content: trimmed } })
  }

  return (
    <aside className="w-80 border-l bg-background flex flex-col shrink-0">
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">Observaciones</span>
          {comments.length > 0 && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
              {comments.length}
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <SidebarMessages comments={comments} loading={loading} />
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 shrink-0">
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
            placeholder="Escribe una observación..."
            disabled={sending}
            className="text-sm"
          />
          <Button size="icon-sm" disabled={!message.trim() || sending} onClick={handleSend}>
            {sending ? <Spinner className="size-3.5" /> : <Send className="size-3.5" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          RR.HH. responderá a tu observación
        </p>
      </div>
    </aside>
  )
}

function SidebarMessages({ comments, loading }: SidebarMessagesProps) {
  if (loading) {
    return (
      <>
        <SidebarMessageSkeleton align="left" />
        <SidebarMessageSkeleton align="right" />
      </>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <MessageSquare className="size-8 text-muted-foreground/20 mb-2" />
        <p className="text-sm text-muted-foreground">Sin observaciones</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Escribe si tienes alguna duda</p>
      </div>
    )
  }

  return (
    <>
      {comments.map((comment) => (
        <SidebarMessageBubble key={comment.id} comment={comment} />
      ))}
    </>
  )
}

function SidebarMessageBubble({ comment }: SidebarMessageBubbleProps) {
  const isHR = comment.author?.role === "hr"
  const isMe = !isHR

  return (
    <div className={cn("flex gap-2", isMe && "flex-row-reverse")}>
      <CommentAvatar name={comment.author?.name} isHR={isHR} />
      <div className={cn("max-w-[80%] space-y-1", isMe && "items-end flex flex-col")}>
        <div className={cn("flex items-center gap-1.5 text-[10px]", isMe && "flex-row-reverse")}>
          <span className="font-medium">{comment.author?.name}</span>
          <Badge variant="secondary" className="text-[9px] px-1 py-0">
            {isMe ? "Tú" : "RR.HH."}
          </Badge>
        </div>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-xs leading-relaxed wrap-break-word",
            isMe ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted"
          )}
        >
          {comment.content}
        </div>
        <p className="text-[10px] text-muted-foreground">{formatRelativeDate(comment.createdAt)}</p>
      </div>
    </div>
  )
}

function SidebarMessageSkeleton({ align }: SidebarMessageSkeletonProps) {
  return (
    <div className={cn("flex gap-2 max-w-[80%]", align === "right" && "ml-auto flex-row-reverse")}>
      <Skeleton className="size-7 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-12 rounded-2xl" />
      </div>
    </div>
  )
}

function CommentAvatar({ name, isHR }: CommentAvatarProps) {
  return (
    <Avatar className="size-7 shrink-0">
      <AvatarFallback
        className={cn(
          "text-[10px] font-semibold",
          isHR ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
