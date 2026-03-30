import { ActiveSelection, type Canvas } from "fabric"
import { useEffect } from "react"

interface UseHotkeysProps {
  canvas: Canvas | null
  undo: () => void
  redo: () => void
  save: (skip?: boolean) => void | Promise<void>
  copy: () => void
  paste: () => void
}

export const useHotkeys = ({ canvas, undo, redo, save, copy, paste }: UseHotkeysProps) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isCtrlKey = event.ctrlKey || event.metaKey
      const isBackspace = event.key === "Backspace"
      const isInput = ["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)

      if (isInput) return

      // Delete key
      if (event.key === "Delete") {
        for (const obj of canvas?.getActiveObjects() || []) {
          canvas?.remove(obj)
        }
        canvas?.discardActiveObject()
        canvas?.renderAll()
      }

      if (isBackspace) {
        const activeObjects = canvas?.getActiveObjects() || []
        for (const obj of activeObjects) {
          canvas?.remove(obj)
        }
        canvas?.discardActiveObject()
      }

      if (isCtrlKey && event.key === "z") {
        event.preventDefault()
        undo()
      }

      if (isCtrlKey && event.key === "y") {
        event.preventDefault()
        redo()
      }

      if (isCtrlKey && event.key === "c") {
        event.preventDefault()
        copy()
      }

      if (isCtrlKey && event.key === "v") {
        event.preventDefault()
        paste()
      }

      if (isCtrlKey && event.key === "s") {
        event.preventDefault()
        save(true)
      }

      if (isCtrlKey && event.key === "a") {
        event.preventDefault()
        canvas?.discardActiveObject()

        const allObjects = canvas?.getObjects().filter((object) => object.selectable)

        if (allObjects && allObjects.length > 0 && canvas) {
          canvas.setActiveObject(new ActiveSelection(allObjects, { canvas }))
          canvas.renderAll()
        }
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [canvas, undo, redo, save, copy, paste])
}
