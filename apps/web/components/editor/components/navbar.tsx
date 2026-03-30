"use client"

import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Download,
  FileText,
  MousePointerClick,
  PenLine,
  Redo2,
  Undo2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useFilePicker } from "use-file-picker"

import { Hint } from "@/components/editor/components/hint"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { ActiveTool, Editor, EditorType } from "../types"
import { isWorkerEditorType } from "../types"

interface NavbarProps {
  editor: Editor | undefined
  activeTool: ActiveTool
  onChangeActiveTool: (tool: ActiveTool) => void
  downloadName?: string
  editorType?: EditorType
  actions?: React.ReactNode
  onTitleChange?: (title: string) => void
  onSaveAsTemplate?: (contentJson: object) => void
  saveStatus?: "idle" | "saving" | "saved"
  requiresSignature?: boolean
  onRequiresSignatureChange?: (value: boolean) => void
}

export const Navbar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  downloadName,
  editorType,
  actions,
  onTitleChange,
  onSaveAsTemplate,
  saveStatus,
  requiresSignature,
  onRequiresSignatureChange,
}: NavbarProps) => {
  const router = useRouter()
  const isWorker = isWorkerEditorType(editorType)
  const canEditTitle = !isWorker && !!onTitleChange

  const [title, setTitle] = useState(downloadName ?? "")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  useEffect(() => {
    setTitle(downloadName ?? "")
  }, [downloadName])

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    const trimmed = title.trim()
    if (trimmed && trimmed !== downloadName) {
      onTitleChange?.(trimmed)
    } else {
      setTitle(downloadName ?? "")
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      ;(e.target as HTMLInputElement).blur()
    }
    if (e.key === "Escape") {
      setTitle(downloadName ?? "")
      setIsEditingTitle(false)
    }
  }

  const { openFilePicker } = useFilePicker({
    accept: ".json",
    // biome-ignore lint/suspicious/noExplicitAny: use-file-picker library doesn't export callback parameter types
    onFilesSuccessfullySelected: ({ plainFiles }: any) => {
      if (plainFiles && plainFiles.length > 0) {
        const file = plainFiles[0]
        const reader = new FileReader()
        reader.readAsText(file, "UTF-8")
        reader.onload = () => {
          editor?.loadJson(reader.result as string)
        }
      }
    },
  })

  return (
    <nav className="flex h-12 shrink-0 items-center border-b bg-white px-2 gap-x-1">
      {/* Logo / volver */}
      <Hint label="Volver" side="bottom" sideOffset={5}>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
        </button>
      </Hint>

      {!isWorker && (
        <>
          <div className="mx-1 h-5 w-px bg-border" />

          {/* Menú archivo */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              Archivo
              <ChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              <DropdownMenuItem onClick={() => openFilePicker()} className="gap-x-2 text-xs">
                <FileText className="size-3.5" />
                Abrir JSON
              </DropdownMenuItem>
              {onSaveAsTemplate && editor && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onSaveAsTemplate(editor.canvas.toJSON())}
                    className="gap-x-2 text-xs"
                  >
                    <Copy className="size-3.5" />
                    Guardar como plantilla
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Herramientas rápidas */}
          <Hint label="Seleccionar" side="bottom" sideOffset={5}>
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-8", activeTool === "select" && "bg-accent")}
              onClick={() => onChangeActiveTool("select")}
            >
              <MousePointerClick className="size-3.5" />
            </Button>
          </Hint>
          <Hint label="Deshacer" side="bottom" sideOffset={5}>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={!editor?.canUndo()}
              onClick={() => editor?.onUndo()}
            >
              <Undo2 className="size-3.5" />
            </Button>
          </Hint>
          <Hint label="Rehacer" side="bottom" sideOffset={5}>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={!editor?.canRedo()}
              onClick={() => editor?.onRedo()}
            >
              <Redo2 className="size-3.5" />
            </Button>
          </Hint>
        </>
      )}

      {/* Centro: título */}
      <div className="flex flex-1 items-center justify-center min-w-0">
        {canEditTitle && isEditingTitle ? (
          <input
            ref={(el) => el?.focus()}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-xs font-medium bg-transparent border-b border-primary outline-none text-center max-w-48"
          />
        ) : (
          <h1
            className={cn(
              "text-xs font-medium truncate max-w-48",
              canEditTitle && "cursor-text hover:bg-muted rounded px-1.5 -mx-1.5"
            )}
            onClick={() => canEditTitle && setIsEditingTitle(true)}
            onKeyDown={(e) => e.key === "Enter" && canEditTitle && setIsEditingTitle(true)}
            role={canEditTitle ? "button" : undefined}
            tabIndex={canEditTitle ? 0 : undefined}
          >
            {title}
          </h1>
        )}
        {/* Toggle tipo de documento — solo HR */}
        {!isWorker && onRequiresSignatureChange && (
          <Tabs
            value={requiresSignature ? "signature" : "readonly"}
            onValueChange={(v) => onRequiresSignatureChange(v === "signature")}
            className="ml-3"
          >
            <TabsList className="h-7">
              <TabsTrigger
                value="readonly"
                className="text-[10px] px-2 py-0.5 gap-1 data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
              >
                <FileText className="size-3" />
                Lectura
              </TabsTrigger>
              <TabsTrigger
                value="signature"
                className="text-[10px] px-2 py-0.5 gap-1 data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
              >
                <PenLine className="size-3" />
                Firma
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        {saveStatus === "saving" && (
          <span className="text-[10px] text-muted-foreground ml-2 flex items-center gap-1">
            <Spinner className="size-3" />
            Guardando...
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="text-[10px] text-green-600 ml-2">Guardado</span>
        )}
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-x-1">
        {actions}
        {isWorker ? (
          <button
            type="button"
            onClick={() => editor?.savePdf(title)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Download className="size-3.5" />
            Descargar PDF
          </button>
        ) : (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Download className="size-3.5" />
              Exportar
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuItem className="text-xs" onClick={() => editor?.savePdf(title)}>
                PDF (A4)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs" onClick={() => editor?.saveJson(title)}>
                JSON (editable)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  )
}
