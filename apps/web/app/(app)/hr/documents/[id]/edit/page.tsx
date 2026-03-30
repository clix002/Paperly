"use client"

import { useMutation, useQuery } from "@apollo/client/react"
import dynamic from "next/dynamic"
import { use, useState } from "react"
import { toast } from "sonner"
import { EditorType } from "@/components/editor/types"
import { Spinner } from "@/components/ui/spinner"
import {
  CreateTemplateDocument,
  GetDocumentByIdDocument,
  TemplateStatus,
  UpdateDocumentDocument,
} from "@/lib/apollo/generated/graphql"

const Editor = dynamic(
  () => import("@/components/editor/components/editor").then((m) => m.Editor),
  { ssr: false }
)

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading } = useQuery(GetDocumentByIdDocument, { variables: { id } })
  const [updateDocument] = useMutation(UpdateDocumentDocument)
  const [createTemplate] = useMutation(CreateTemplateDocument, {
    onCompleted: () => toast.success("Plantilla creada"),
    onError: (err) => toast.error(err.message),
  })

  // null = sin cambios del usuario, usar valor del doc
  const [requiresSignatureOverride, setRequiresSignatureOverride] = useState<boolean | null>(null)

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    )
  }

  const doc = data?.getDocumentById
  if (!doc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Documento no encontrado</p>
      </div>
    )
  }

  const requiresSignature = requiresSignatureOverride ?? doc.requiresSignature

  const handleSave = async (values: { json: string; height: number; width: number }) => {
    await updateDocument({
      variables: { id, input: { contentJson: JSON.parse(values.json) } },
    })
  }

  const handleTitleChange = async (title: string) => {
    await updateDocument({ variables: { id, input: { title } } })
  }

  const handleRequiresSignatureChange = async (value: boolean) => {
    setRequiresSignatureOverride(value)
    await updateDocument({ variables: { id, input: { requiresSignature: value } } })
  }

  const handleSaveAsTemplate = (contentJson: object) => {
    createTemplate({
      variables: {
        input: { title: doc.title, contentJson, status: TemplateStatus.Published },
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background">
      <Editor
        downloadName={doc.title}
        initialData={{
          id: doc.id,
          json:
            typeof doc.contentJson === "string" ? doc.contentJson : JSON.stringify(doc.contentJson),
          width: 900,
          height: 1200,
        }}
        editorType={EditorType.Document}
        onSave={handleSave}
        onTitleChange={handleTitleChange}
        onSaveAsTemplate={handleSaveAsTemplate}
        requiresSignature={requiresSignature}
        onRequiresSignatureChange={handleRequiresSignatureChange}
      />
    </div>
  )
}
