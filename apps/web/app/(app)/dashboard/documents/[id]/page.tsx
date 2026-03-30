"use client"

import { useMutation, useQuery } from "@apollo/client/react"
import { Check, MessageSquare, RotateCcw, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useState } from "react"
import { toast } from "sonner"
import { DocumentStatusBadge } from "@/components/dashboard/document-status-badge"
import { Editor } from "@/components/editor/components/editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { GetDocumentByIdDocument, SignDocumentDocument } from "@/lib/apollo/generated/graphql"
import { CommentsSidebar } from "./_components/comments-sidebar"
import { buildDocumentContext, type DocumentContext } from "./_lib/document-context"

interface NavbarActionsProps {
  ctx: DocumentContext
  signing: boolean
  onToggleComments: () => void
  onMarkViewed: () => void
}

interface EmptyDocumentViewProps {
  title: string
  status: string
  requiresSignature: boolean
  navbarActions: React.ReactNode
}

interface DocInfoBarProps {
  senderName?: string | null
  createdAt: string
}

export default function DocumentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [commentsOpen, setCommentsOpen] = useState(false)

  const { data, loading } = useQuery(GetDocumentByIdDocument, { variables: { id } })

  const [signDocument, { loading: signing }] = useMutation(SignDocumentDocument, {
    onCompleted: () => {
      toast.success("Documento firmado correctamente")
      router.push("/dashboard")
    },
    onError: (err) => toast.error(err.message),
  })

  if (loading) return <PageLoader />

  const doc = data?.getDocumentById
  if (!doc) return <NotFound />

  const ctx = buildDocumentContext(doc.status, doc.requiresSignature)
  const showComments = ctx.openCommentsByDefault || commentsOpen

  const contentJson =
    typeof doc.contentJson === "string" ? doc.contentJson : JSON.stringify(doc.contentJson)

  const handleSignComplete = async (canvasJson: string) => {
    await signDocument({ variables: { id, contentJson: JSON.parse(canvasJson) } })
  }

  const handleMarkViewed = () => {
    signDocument({ variables: { id } })
  }

  const navbarActions = (
    <NavbarActions
      ctx={ctx}
      signing={signing}
      onToggleComments={() => setCommentsOpen((v) => !v)}
      onMarkViewed={handleMarkViewed}
    />
  )

  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {ctx.inReviewBanner && <InReviewBanner />}

        {doc.contentJson ? (
          <Editor
            initialData={{ id, json: contentJson, width: 900, height: 1200 }}
            editorType={ctx.editorType}
            downloadName={doc.title}
            navbarActions={navbarActions}
            onSignComplete={ctx.canSign ? handleSignComplete : undefined}
          />
        ) : (
          <EmptyDocumentView
            title={doc.title}
            status={doc.status}
            requiresSignature={doc.requiresSignature}
            navbarActions={navbarActions}
          />
        )}

        <DocInfoBar senderName={doc.sender?.name} createdAt={doc.createdAt} />
      </div>

      {showComments && <CommentsSidebar documentId={id} onClose={() => setCommentsOpen(false)} />}
    </div>
  )
}

function NavbarActions({ ctx, signing, onToggleComments, onMarkViewed }: NavbarActionsProps) {
  if (!ctx.showObservationsButton && ctx.primaryAction === null) return null

  return (
    <div className="flex items-center gap-2">
      {ctx.showObservationsButton && (
        <Button variant="outline" size="sm" onClick={onToggleComments}>
          <MessageSquare className="size-4 mr-1.5" />
          Observaciones
        </Button>
      )}

      {ctx.primaryAction === "mark_viewed" && (
        <Button size="sm" variant="outline" onClick={onMarkViewed} disabled={signing}>
          {signing ? <Spinner className="size-4 mr-1.5" /> : <Check className="size-4 mr-1.5" />}
          Marcar como visto
        </Button>
      )}
    </div>
  )
}

function InReviewBanner() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm shrink-0">
      <RotateCcw className="size-3.5 shrink-0" />
      <span>
        RR.HH. está revisando tu observación.{" "}
        <span className="font-medium">Puedes ver y continuar la conversación aquí.</span>
      </span>
    </div>
  )
}

function EmptyDocumentView({
  title,
  status,
  requiresSignature,
  navbarActions,
}: EmptyDocumentViewProps) {
  return (
    <>
      <div className="border-b bg-background px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon-sm">
              <MessageSquare className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-sm font-semibold">{title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <DocumentStatusBadge status={status} />
              <Badge variant="secondary" className="text-[10px]">
                {requiresSignature ? "Requiere firma" : "Solo lectura"}
              </Badge>
            </div>
          </div>
        </div>
        {navbarActions}
      </div>
      <div className="flex-1 bg-muted/30 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Este documento no tiene contenido visual</p>
      </div>
    </>
  )
}

function DocInfoBar({ senderName, createdAt }: DocInfoBarProps) {
  return (
    <div className="border-t bg-background px-6 py-2 flex items-center gap-4 text-xs text-muted-foreground shrink-0">
      <div className="flex items-center gap-1.5">
        <User className="size-3" />
        <span>Enviado por: {senderName ?? "Sistema"}</span>
      </div>
      <span>
        {new Date(createdAt).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </span>
    </div>
  )
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="size-8" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="p-8 text-center space-y-2">
      <p className="text-muted-foreground text-sm">Documento no encontrado</p>
      <Link href="/dashboard" className="text-primary hover:underline text-sm">
        Volver al inicio
      </Link>
    </div>
  )
}
