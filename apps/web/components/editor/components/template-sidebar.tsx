"use client"

import { useQuery } from "@apollo/client/react"
import { AlertTriangle, FileText, Loader2, Search } from "lucide-react"
import { useState } from "react"
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close"
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GetTemplatesDocument } from "@/lib/apollo/generated/graphql"
import { cn } from "@/lib/utils"
import type { ActiveTool, Editor } from "../types"

interface TemplateSidebarProps {
  editor: Editor | undefined
  activeTool: ActiveTool
  onChangeActiveTool: (tool: ActiveTool) => void
  onTemplateSelect?: (title: string) => void
}

export const TemplateSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  onTemplateSelect,
}: TemplateSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const { data, loading } = useQuery(GetTemplatesDocument, {
    skip: activeTool !== "templates",
  })

  const templates = data?.getTemplates ?? []

  const filteredTemplates = templates.filter((t) => {
    if (searchQuery.trim() === "") return true
    const query = searchQuery.toLowerCase()
    return t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query)
  })

  const onClose = () => {
    onChangeActiveTool("select")
  }

  const handleSelectTemplate = (title: string, contentJson: unknown) => {
    if (!editor || !contentJson) return
    const json = typeof contentJson === "string" ? contentJson : JSON.stringify(contentJson)
    editor.loadJson(json)
    onTemplateSelect?.(title)
    onChangeActiveTool("select")
  }

  return (
    <aside
      className={cn(
        "bg-background relative border-r z-40 w-90 h-full flex flex-col",
        activeTool === "templates" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Templates" description="Selecciona una plantilla como base" />

      <div className="p-4 border-b flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantillas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && filteredTemplates.length === 0 && (
            <div className="flex flex-col gap-y-4 items-center justify-center flex-1 p-8">
              <AlertTriangle className="size-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {searchQuery.trim() ? "Sin resultados" : "No hay plantillas"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery.trim()
                    ? "Prueba con otros términos"
                    : "Las plantillas aparecerán aquí cuando se creen."}
                </p>
              </div>
            </div>
          )}

          {!loading && filteredTemplates.length > 0 && (
            <div className="p-4 flex flex-col gap-2">
              {filteredTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="w-full h-auto p-4 flex items-start gap-3 text-left justify-start"
                  onClick={() => handleSelectTemplate(template.title, template.contentJson)}
                >
                  <FileText className="size-5 shrink-0 mt-0.5 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{template.title}</p>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <ToolSidebarClose onClick={onClose} />
    </aside>
  )
}
