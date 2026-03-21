"use client"

import { ChevronLeft, ChevronRight, Maximize2, Minus, Pencil, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Hint } from "@/components/editor/components/hint"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { Editor } from "../types"

interface FooterProps {
  editor: Editor | undefined
}

export const Footer = ({ editor }: FooterProps) => {
  const [isPagePopoverOpen, setIsPagePopoverOpen] = useState(false)
  const [zoomPercent, setZoomPercent] = useState(100)

  const updateZoom = useCallback(() => {
    if (!editor?.canvas) return
    const zoom = editor.canvas.getZoom()
    setZoomPercent(Math.round(zoom * 100))
  }, [editor])

  useEffect(() => {
    if (!editor?.canvas) return
    updateZoom()

    const canvas = editor.canvas
    const handler = () => updateZoom()
    canvas.on("after:render", handler)
    return () => {
      canvas.off("after:render", handler)
    }
  }, [editor, updateZoom])

  return (
    <footer className="flex h-9 shrink-0 items-center justify-between border-t bg-background px-2">
      {/* Páginas */}
      {editor && (
        <Popover open={isPagePopoverOpen} onOpenChange={setIsPagePopoverOpen}>
          <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Pencil className="size-3" />
            {editor.pagesArrayRef.current.length > 0
              ? `${editor.activePageIndex + 1} / ${editor.pagesArrayRef.current.length}`
              : "1"}
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="start" side="top">
            <div className="space-y-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-7"
                onClick={() => {
                  if (editor.activePageIndex > 0) {
                    editor.changePage(editor.activePageIndex - 1)
                    setIsPagePopoverOpen(false)
                  }
                }}
                disabled={editor.activePageIndex === 0 || editor.pagesArrayRef.current.length === 0}
              >
                <ChevronLeft className="size-3 mr-1.5" />
                Anterior
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-7"
                onClick={() => {
                  if (editor.activePageIndex < editor.pagesArrayRef.current.length - 1) {
                    editor.changePage(editor.activePageIndex + 1)
                    setIsPagePopoverOpen(false)
                  }
                }}
                disabled={
                  editor.activePageIndex >= editor.pagesArrayRef.current.length - 1 ||
                  editor.pagesArrayRef.current.length === 0
                }
              >
                <ChevronRight className="size-3 mr-1.5" />
                Siguiente
              </Button>
              <Separator className="my-0.5" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-7 text-primary hover:text-primary"
                onClick={() => {
                  editor.addPage()
                  setIsPagePopoverOpen(false)
                }}
              >
                <Plus className="size-3 mr-1.5" />
                Agregar página
              </Button>
              {editor.pagesArrayRef.current.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-7 text-destructive hover:text-destructive"
                  onClick={() => {
                    editor.deletePage(editor.activePageIndex)
                    setIsPagePopoverOpen(false)
                  }}
                >
                  <Trash2 className="size-3 mr-1.5" />
                  Eliminar página
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Zoom */}
      <div className="flex items-center gap-x-0.5">
        <Hint label="Alejar" side="top" sideOffset={5}>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => {
              editor?.zoomOut()
              updateZoom()
            }}
          >
            <Minus className="size-3" />
          </Button>
        </Hint>

        <Hint label="Ajustar" side="top" sideOffset={5}>
          <button
            type="button"
            className="min-w-10 rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors tabular-nums"
            onClick={() => {
              editor?.resetZoom()
              updateZoom()
            }}
          >
            {zoomPercent}%
          </button>
        </Hint>

        <Hint label="Acercar" side="top" sideOffset={5}>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => {
              editor?.zoomIn()
              updateZoom()
            }}
          >
            <Plus className="size-3" />
          </Button>
        </Hint>

        <div className="mx-0.5 h-4 w-px bg-border" />

        <Hint label="Ajustar al canvas" side="top" sideOffset={5}>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => {
              editor?.resetZoom()
              updateZoom()
            }}
          >
            <Maximize2 className="size-3" />
          </Button>
        </Hint>
      </div>
    </footer>
  )
}
