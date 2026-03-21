"use client"

import { useEffect, useMemo, useState } from "react"
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close"
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { ActiveTool, Editor } from "../types"

interface OpacitySidebarProps {
  editor: Editor | undefined
  activeTool: ActiveTool
  onChangeActiveTool: (tool: ActiveTool) => void
}

export const OpacitySidebar = ({ editor, activeTool, onChangeActiveTool }: OpacitySidebarProps) => {
  const initialValue = editor?.getActiveOpacity() || 1
  const selectedObject = useMemo(() => editor?.selectedObjects[0], [editor?.selectedObjects])

  const [opacity, setOpacity] = useState(initialValue)

  useEffect(() => {
    if (selectedObject) {
      setOpacity(selectedObject.get("opacity") || 1)
    }
  }, [selectedObject])

  const onClose = () => {
    onChangeActiveTool("select")
  }

  const onChange = (value: number) => {
    editor?.changeOpacity(value)
    setOpacity(value)
  }

  return (
    <aside
      className={cn(
        "bg-background relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "opacity" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Opacity" description="Change the opacity of the selected object" />
      <ScrollArea>
        <div className="p-4 space-y-4 border-b">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={opacity}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  )
}
