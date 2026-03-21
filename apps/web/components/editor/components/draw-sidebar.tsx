"use client"

import { ColorPicker } from "@/components/editor/components/color-picker"
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close"
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { type ActiveTool, type Editor, STROKE_COLOR, STROKE_WIDTH } from "../types"

interface DrawSidebarProps {
  editor: Editor | undefined
  activeTool: ActiveTool
  onChangeActiveTool: (tool: ActiveTool) => void
}

export const DrawSidebar = ({ editor, activeTool, onChangeActiveTool }: DrawSidebarProps) => {
  const colorValue = editor?.getActiveStrokeColor() || STROKE_COLOR
  const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH

  const onClose = () => {
    editor?.disableDrawingMode()
    onChangeActiveTool("select")
  }

  const onColorChange = (value: string) => {
    editor?.changeStrokeColor(value)
  }

  const onWidthChange = (value: number) => {
    editor?.changeStrokeWidth(value)
  }

  return (
    <aside
      className={cn(
        "bg-background relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "draw" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Drawing mode" description="Modify brush settings" />
      <ScrollArea>
        <div className="p-4 space-y-6 border-b">
          <Label className="text-sm">Brush width</Label>
          <input
            type="range"
            min={0}
            max={100}
            value={widthValue}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <div className="p-4 space-y-6">
          <ColorPicker value={colorValue} onChange={onColorChange} />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  )
}
