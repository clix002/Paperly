import { ActiveSelection, type Canvas, type FabricObject } from "fabric"
import { useCallback, useRef } from "react"

interface UseClipboardProps {
  canvas: Canvas | null
}

export const useClipboard = ({ canvas }: UseClipboardProps) => {
  const clipboard = useRef<FabricObject | null>(null)

  const copy = useCallback(async () => {
    const activeObject = canvas?.getActiveObject()
    if (!activeObject) return

    const cloned = await activeObject.clone()
    clipboard.current = cloned
  }, [canvas])

  const paste = useCallback(async () => {
    if (!clipboard.current || !canvas) return

    const clonedObj = await clipboard.current.clone()
    canvas.discardActiveObject()

    clonedObj.set({
      left: (clonedObj.left ?? 0) + 10,
      top: (clonedObj.top ?? 0) + 10,
      evented: true,
    })

    if (clonedObj instanceof ActiveSelection) {
      clonedObj.canvas = canvas
      for (const obj of clonedObj.getObjects()) {
        canvas.add(obj)
      }
      clonedObj.setCoords()
    } else {
      canvas.add(clonedObj)
    }

    clipboard.current.top = (clipboard.current.top ?? 0) + 10
    clipboard.current.left = (clipboard.current.left ?? 0) + 10
    canvas.setActiveObject(clonedObj)
    canvas.requestRenderAll()
  }, [canvas])

  return { copy, paste }
}
