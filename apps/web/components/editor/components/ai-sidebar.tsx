"use client"

import { Bot } from "lucide-react"
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close"
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { ActiveTool, Editor } from "../types"

interface AiSidebarProps {
  editor: Editor | undefined
  activeTool: ActiveTool
  onChangeActiveTool: (tool: ActiveTool) => void
}

export const AiSidebar = ({ editor: _editor, activeTool, onChangeActiveTool }: AiSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select")
  }

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "ai" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="AI" description="Generate content using AI" />
      <ScrollArea>
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <Bot className="size-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">AI integration coming soon</p>
            <p className="text-xs text-muted-foreground mt-1">
              This feature will allow you to generate images and content using AI directly in the
              editor.
            </p>
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  )
}
