"use client"

import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close"
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { type ActiveTool, type Editor, filters } from "../types"

interface FilterSidebarProps {
  editor: Editor | undefined
  activeTool: ActiveTool
  onChangeActiveTool: (tool: ActiveTool) => void
}

export const FilterSidebar = ({ editor, activeTool, onChangeActiveTool }: FilterSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select")
  }

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "filter" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Filters" description="Apply a filter to selected image" />
      <ScrollArea>
        <div className="p-4 space-y-1 border-b">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant="secondary"
              size="lg"
              className="w-full h-16 justify-start text-left"
              onClick={() => editor?.changeImageFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  )
}
