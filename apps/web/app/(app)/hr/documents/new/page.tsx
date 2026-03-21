"use client"

import { useMutation } from "@apollo/client/react"
import dynamic from "next/dynamic"
import { useRef, useState } from "react"

import { EditorType } from "@/components/editor/types"
import {
  CreateDocumentDocument,
  DocumentStatus,
  UpdateDocumentDocument,
} from "@/lib/apollo/generated/graphql"

const Editor = dynamic(
  () => import("@/components/editor/components/editor").then((m) => m.Editor),
  {
    ssr: false,
  }
)

export default function NewDocumentPage() {
  const documentIdRef = useRef<string | null>(null)
  const titleRef = useRef("Nuevo documento")
  const requiresSignatureRef = useRef(false)
  const [title, setTitle] = useState("Nuevo documento")
  const [requiresSignature, setRequiresSignature] = useState(false)

  const [createDocument] = useMutation(CreateDocumentDocument)
  const [updateDocument] = useMutation(UpdateDocumentDocument)

  const handleTemplateSelect = (templateTitle: string) => {
    titleRef.current = templateTitle
    setTitle(templateTitle)
  }

  const handleSave = async (values: { json: string; height: number; width: number }) => {
    const contentJson = JSON.parse(values.json)

    if (documentIdRef.current) {
      await updateDocument({ variables: { id: documentIdRef.current, input: { contentJson } } })
      return
    }

    const { data } = await createDocument({
      variables: {
        input: {
          title: titleRef.current,
          contentJson,
          status: DocumentStatus.Draft,
          requiresSignature: requiresSignatureRef.current,
        },
      },
    })

    if (!data?.createDocument.id) return

    documentIdRef.current = data.createDocument.id
    window.history.replaceState(null, "", `/hr/documents/${data.createDocument.id}/edit`)
  }

  const handleTitleChange = async (newTitle: string) => {
    titleRef.current = newTitle
    if (documentIdRef.current) {
      await updateDocument({ variables: { id: documentIdRef.current, input: { title: newTitle } } })
    }
  }

  const handleRequiresSignatureChange = async (value: boolean) => {
    setRequiresSignature(value)
    requiresSignatureRef.current = value
    if (documentIdRef.current) {
      await updateDocument({
        variables: { id: documentIdRef.current, input: { requiresSignature: value } },
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background">
      <Editor
        downloadName={title}
        editorType={EditorType.Create}
        onSave={handleSave}
        onTitleChange={handleTitleChange}
        onTemplateSelect={handleTemplateSelect}
        requiresSignature={requiresSignature}
        onRequiresSignatureChange={handleRequiresSignatureChange}
      />
    </div>
  )
}
