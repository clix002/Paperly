"use client"

import { useMutation, useQuery } from "@apollo/client/react"
import { Clock, MessageSquare, Send } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { WorkerAvatar } from "@/app/(app)/hr/queries/_components/worker-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  CreateCommentDocument,
  GetCommentsByDocumentDocument,
} from "@/lib/apollo/generated/graphql"
import { cn, formatRelativeDate } from "@/lib/utils"
import type { Comment } from "../_lib/tracking"

interface ConversationPanelProps {
  documentId: string
}

export function ConversationPanel({ documentId }: ConversationPanelProps) {
  const [message, setMessage] = useState("")

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

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed) return
    createComment({ variables: { documentId, content: trimmed } })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <ConversationHeader count={comments.length} />
      <ConversationMessages comments={comments} loading={loading} />
      <ConversationInput
        message={message}
        onMessageChange={setMessage}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
        sending={sending}
      />
    </>
  )
}

interface ConversationHeaderProps {
  count: number
}

function ConversationHeader({ count }: ConversationHeaderProps) {
  return (
    <div className="px-5 py-2 border-b flex items-center gap-2">
      <MessageSquare className="size-3.5 text-muted-foreground" />
      <span className="text-xs font-medium">Observaciones</span>
      {count > 0 && (
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
          {count}
        </Badge>
      )}
    </div>
  )
}

interface ConversationMessagesProps {
  comments: Comment[]
  loading: boolean
}

function ConversationMessages({ comments, loading }: ConversationMessagesProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <MessageSquare className="size-8 text-muted-foreground/20 mb-2" />
        <p className="text-xs text-muted-foreground">Sin observaciones</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-3">
      {comments.map((comment) => (
        <CommentBubble key={comment.id} comment={comment} />
      ))}
    </div>
  )
}

interface CommentBubbleProps {
  comment: Comment
}

function CommentBubble({ comment }: CommentBubbleProps) {
  const isHR = comment.author?.role === "hr"

  return (
    <div className={cn("flex gap-2.5 max-w-[85%]", isHR && "ml-auto flex-row-reverse")}>
      <WorkerAvatar name={comment.author?.name} isHR={isHR} size="sm" />
      <div>
        <div className={cn("flex items-center gap-1.5 mb-0.5", isHR && "flex-row-reverse")}>
          <span className="text-[10px] font-medium">{comment.author?.name}</span>
          <Badge variant="secondary" className="text-[8px] px-1 py-0 leading-tight">
            {isHR ? "HR" : "Trabajador"}
          </Badge>
        </div>
        <Card className={cn("p-2.5", isHR ? "bg-primary/5 border-primary/20" : "bg-muted/50")}>
          <p className="text-xs leading-relaxed">{comment.content}</p>
        </Card>
        <p className={cn("text-[9px] text-muted-foreground mt-0.5", isHR && "text-right")}>
          {formatRelativeDate(comment.createdAt)}
        </p>
      </div>
    </div>
  )
}

interface ConversationInputProps {
  message: string
  onMessageChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onSend: () => void
  sending: boolean
}

function ConversationInput({
  message,
  onMessageChange,
  onKeyDown,
  onSend,
  sending,
}: ConversationInputProps) {
  return (
    <div className="border-t p-3">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Responder..."
          disabled={sending}
          className="h-8 text-xs"
        />
        <Button
          onClick={onSend}
          disabled={!message.trim() || sending}
          size="icon"
          className="size-8 shrink-0"
        >
          {sending ? <Clock className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
        </Button>
      </div>
    </div>
  )
}
