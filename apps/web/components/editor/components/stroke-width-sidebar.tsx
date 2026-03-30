"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { type ActiveTool, type Editor, STROKE_DASH_ARRAY, STROKE_WIDTH } from "../types"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ToolSidebarHeader } from "./tool-sidebar-header"

interface StrokeWidthSidebarProps {
  editor: Editor | undefined
  activeTool: ActiveTool
  onChangeActiveTool: (tool: ActiveTool) => void
}

export const StrokeWidthSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokeWidthSidebarProps) => {
  const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH
  const typeValue = editor?.getActiveStrokeDashArray() || STROKE_DASH_ARRAY

  const onClose = () => {
    onChangeActiveTool("select")
  }

  const onChangeStrokeWidth = (value: number) => {
    editor?.changeStrokeWidth(value)
  }

  const onChangeStrokeType = (value: number[]) => {
    editor?.changeStrokeDashArray(value)
  }

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "stroke-width" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Stroke options" description="Modify the stroke of your element" />
      <ScrollArea>
        <div className="p-4 space-y-4 border-b">
          <Label className="text-sm">Stroke width</Label>
          <input
            type="range"
            min={0}
            max={100}
            value={widthValue}
            onChange={(e) => onChangeStrokeWidth(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <div className="p-4 space-y-4 border-b">
          <Label className="text-sm">Stroke type</Label>
          <Button
            onClick={() => onChangeStrokeType([])}
            variant="secondary"
            size="lg"
            className={cn(
              "w-full h-16 justify-start text-left",
              JSON.stringify(typeValue) === `[]` && "border-2 border-blue-500"
            )}
            style={{
              padding: "8px 16px",
            }}
          >
            <div className="w-full border-black rounded-full border-4" />
          </Button>
          <Button
            onClick={() => onChangeStrokeType([5, 5])}
            variant="secondary"
            size="lg"
            className={cn(
              "w-full h-16 justify-start text-left",
              JSON.stringify(typeValue) === `[5,5]` && "border-2 border-blue-500"
            )}
            style={{
              padding: "8px 16px",
            }}
          >
            <div className="w-full border-black rounded-full border-4 border-dashed" />
          </Button>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  )
}
