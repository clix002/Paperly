"use client"

import {
  FileSignature,
  ImageIcon,
  LayoutTemplate,
  Pencil,
  Settings,
  Shapes,
  Type,
} from "lucide-react"
import { Hint } from "@/components/editor/components/hint"
import { cn } from "@/lib/utils"
import {
  type ActiveTool,
  EditorType,
  type EditorType as EditorTypeEnum,
  isWorkerEditorType,
} from "../types"

interface SidebarProps {
  activeTool: ActiveTool
  onChangeActiveTool: (tool: ActiveTool) => void
  editorType?: EditorTypeEnum
}

const HR_TOOLS = [
  { tool: "images" as ActiveTool, icon: ImageIcon, label: "Imagen" },
  { tool: "text" as ActiveTool, icon: Type, label: "Texto" },
  { tool: "shapes" as ActiveTool, icon: Shapes, label: "Figuras" },
  { tool: "draw" as ActiveTool, icon: Pencil, label: "Dibujar" },
  { tool: "settings" as ActiveTool, icon: Settings, label: "Ajustes" },
]

interface ToolButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
  onClick: () => void
}

function ToolButton({ icon: Icon, label, isActive, onClick }: ToolButtonProps) {
  return (
    <Hint label={label} side="right" sideOffset={8}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex items-center justify-center size-10 rounded-lg transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="size-4.5" />
      </button>
    </Hint>
  )
}

export const Sidebar = ({ activeTool, onChangeActiveTool, editorType }: SidebarProps) => {
  const isWorker = isWorkerEditorType(editorType)

  if (editorType === EditorType.View) {
    return null
  }

  return (
    <aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-r bg-white py-2">
      {/* Templates: solo al crear */}
      {editorType === EditorType.Create && (
        <>
          <ToolButton
            icon={LayoutTemplate}
            label="Templates"
            isActive={activeTool === "templates"}
            onClick={() => onChangeActiveTool("templates")}
          />
          <div className="mx-auto my-1 h-px w-6 bg-border" />
        </>
      )}

      {/* Firmas: solo worker en modo Sign */}
      {editorType === EditorType.Sign && (
        <ToolButton
          icon={FileSignature}
          label="Firmas"
          isActive={activeTool === "signatures"}
          onClick={() => onChangeActiveTool("signatures")}
        />
      )}

      {/* Herramientas: solo HR */}
      {!isWorker &&
        HR_TOOLS.map(({ tool, icon, label }) => (
          <ToolButton
            key={tool}
            icon={icon}
            label={label}
            isActive={activeTool === tool}
            onClick={() => onChangeActiveTool(tool)}
          />
        ))}
    </aside>
  )
}
