"use client"

import { debounce } from "es-toolkit"
import { Canvas } from "fabric"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { DrawSidebar } from "@/components/editor/components/draw-sidebar"
import { FillColorSidebar } from "@/components/editor/components/fill-color-sidebar"
import { FilterSidebar } from "@/components/editor/components/filter-sidebar"
import { FontSidebar } from "@/components/editor/components/font-sidebar"
import { Footer } from "@/components/editor/components/footer"
import { ImageSidebar } from "@/components/editor/components/image-sidebar"
import { Navbar } from "@/components/editor/components/navbar"
import { OpacitySidebar } from "@/components/editor/components/opacity-sidebar"
import { SettingsSidebar } from "@/components/editor/components/settings-sidebar"
import { ShapeSidebar } from "@/components/editor/components/shape-sidebar"
import { Sidebar } from "@/components/editor/components/sidebar"
import { SignaturePanel } from "@/components/editor/components/signature-panel"
import { StrokeColorSidebar } from "@/components/editor/components/stroke-color-sidebar"
import { StrokeWidthSidebar } from "@/components/editor/components/stroke-width-sidebar"
import { TemplateSidebar } from "@/components/editor/components/template-sidebar"
import { TextSidebar } from "@/components/editor/components/text-sidebar"
import { Toolbar } from "@/components/editor/components/toolbar"
import { useEditor } from "@/components/editor/hooks/use-editor"
import { type ActiveTool, EditorType, isWorkerEditorType, selectionDependentTools } from "../types"

interface EditorData {
  id: string
  json: string
  width: number
  height: number
}

interface EditorProps {
  initialData?: EditorData
  editorType?: EditorType
  downloadName?: string
  navbarActions?: React.ReactNode
  onSave?: (values: { json: string; height: number; width: number }) => Promise<void> | void
  onTitleChange?: (title: string) => void
  onSaveAsTemplate?: (contentJson: object) => void
  onTemplateSelect?: (title: string) => void
  onSignComplete?: (canvasJson: string) => Promise<void>
  requiresSignature?: boolean
  onRequiresSignatureChange?: (value: boolean) => void
}

export const Editor = ({
  initialData,
  editorType,
  downloadName,
  navbarActions,
  onSave,
  onTitleChange,
  onSaveAsTemplate,
  onTemplateSelect,
  onSignComplete,
  requiresSignature,
  onRequiresSignatureChange,
}: EditorProps) => {
  const isWorker = isWorkerEditorType(editorType)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally stable debounced ref — onSave is captured by closure
  const debouncedSave = useMemo(
    () =>
      debounce((values: { json: string; height: number; width: number }) => {
        if (onSave) {
          setSaveStatus("saving")
          Promise.resolve(onSave(values))
            .then(() => {
              setSaveStatus("saved")
              setTimeout(() => setSaveStatus("idle"), 2000)
            })
            .catch(() => {
              setSaveStatus("idle")
              toast.error("Error al guardar")
            })
        }
      }, 500),
    []
  )

  const [activeTool, setActiveTool] = useState<ActiveTool>("select")

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select")
    }
  }, [activeTool])

  const { init, editor } = useEditor({
    defaultState: initialData?.json,
    defaultWidth: initialData?.width,
    defaultHeight: initialData?.height,
    clearSelectionCallback: onClearSelection,
    saveCallback: isWorker ? undefined : debouncedSave,
  })

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === "draw") editor?.enableDrawingMode()
      if (activeTool === "draw") editor?.disableDrawingMode()
      if (tool === activeTool) return setActiveTool("select")
      setActiveTool(tool)
    },
    [activeTool, editor]
  )

  const canvasRef = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const isViewMode = editorType === EditorType.View
    const canvas = new Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
      selection: !isViewMode,
    })

    if (isViewMode) {
      canvas.defaultCursor = "default"
      canvas.hoverCursor = "default"
    }

    init({
      initialCanvas: canvas,
      // biome-ignore lint/style/noNonNullAssertion: containerRef is guaranteed to be initialized in useEffect after render
      initialContainer: containerRef.current!,
    })

    if (isViewMode) {
      setTimeout(() => {
        canvas.forEachObject((obj) => {
          obj.selectable = false
          obj.evented = false
        })
        canvas.requestRenderAll()
      }, 100)
    }

    return () => {
      canvas.dispose()
    }
  }, [init, editorType])

  const sidebarProps = { editor, activeTool, onChangeActiveTool }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Navbar */}
      <Navbar
        editor={editor}
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        downloadName={downloadName}
        editorType={editorType}
        actions={navbarActions}
        onTitleChange={onTitleChange}
        onSaveAsTemplate={onSaveAsTemplate}
        saveStatus={saveStatus}
        requiresSignature={requiresSignature}
        onRequiresSignatureChange={onRequiresSignatureChange}
      />

      {/* Contenido principal: sidebar + canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de herramientas */}
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          editorType={editorType}
        />

        {/* Sidebars de edición (HR) */}
        {!isWorker && (
          <>
            <ShapeSidebar {...sidebarProps} />
            <FillColorSidebar {...sidebarProps} />
            <StrokeColorSidebar {...sidebarProps} />
            <StrokeWidthSidebar {...sidebarProps} />
            <OpacitySidebar {...sidebarProps} />
            <TextSidebar {...sidebarProps} />
            <FontSidebar {...sidebarProps} />
            <ImageSidebar {...sidebarProps} />
            <TemplateSidebar {...sidebarProps} onTemplateSelect={onTemplateSelect} />
            <FilterSidebar {...sidebarProps} />
            <DrawSidebar {...sidebarProps} />
            <SettingsSidebar {...sidebarProps} />
          </>
        )}

        {/* Panel de firma (Worker) */}
        {editorType === EditorType.Sign && onSignComplete && (
          <SignaturePanel editor={editor} onSignComplete={onSignComplete} />
        )}

        {/* Canvas + Toolbar + Footer */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {!isWorker && (
            <Toolbar {...sidebarProps} key={JSON.stringify(editor?.canvas.getActiveObject())} />
          )}
          <div className="relative flex-1 min-h-0">
            <div className="absolute inset-0 overflow-auto bg-neutral-100" ref={containerRef}>
              <canvas ref={canvasRef} style={{ display: "block" }} />
            </div>
          </div>
          <Footer editor={editor} />
        </main>
      </div>
    </div>
  )
}
