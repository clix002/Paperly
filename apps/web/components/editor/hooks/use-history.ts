import type { Canvas, Rect } from "fabric"
import { useCallback, useRef, useState } from "react"

import type { NamedFabricObject } from "../types"

interface UseHistoryProps {
  canvas: Canvas | null
  saveCallback?: (values: { json: string; height: number; width: number }) => void
  onThumbnailGenerated?: (dataUrl: string) => Promise<void>
}

export const useHistory = ({ canvas, saveCallback, onThumbnailGenerated }: UseHistoryProps) => {
  const [historyIndex, setHistoryIndex] = useState(0)
  const canvasHistory = useRef<string[]>([])
  const skipSave = useRef(false)

  const canUndo = useCallback(() => {
    return historyIndex > 0
  }, [historyIndex])

  const canRedo = useCallback(() => {
    return historyIndex < canvasHistory.current.length - 1
  }, [historyIndex])

  const save = useCallback(
    async (skip = false) => {
      if (!canvas) return

      const currentState = canvas.toJSON()
      const json = JSON.stringify(currentState)

      if (!skip && !skipSave.current) {
        canvasHistory.current.push(json)
        setHistoryIndex(canvasHistory.current.length - 1)
      }

      const workspace = canvas
        .getObjects()
        .find((object) => (object as NamedFabricObject).name === "clip")
      const height = workspace?.height || 0
      const width = workspace?.width || 0

      saveCallback?.({ json, height, width })
    },
    [canvas, saveCallback]
  )

  const generateThumbnail = useCallback(async () => {
    if (!canvas || !onThumbnailGenerated) return
    const workspace = canvas
      .getObjects()
      .find((object) => (object as NamedFabricObject).name === "clip")
    const height = workspace?.height || 0
    const width = workspace?.width || 0

    const options = {
      format: "png" as const,
      quality: 1,
      multiplier: 1,
      width: width || canvas.width,
      height: height || canvas.height,
      left: (workspace as Rect)?.left || 0,
      top: (workspace as Rect)?.top || 0,
    }

    const originalTransform = canvas.viewportTransform
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    const dataUrl = canvas.toDataURL(options)
    canvas.setViewportTransform(originalTransform || [1, 0, 0, 1, 0, 0])

    // Return the dataURL directly instead of uploading to external services
    await onThumbnailGenerated(dataUrl)
  }, [canvas, onThumbnailGenerated])

  const undo = useCallback(async () => {
    if (canUndo() && canvas) {
      skipSave.current = true
      canvas.clear()
      canvas.renderAll()

      const previousIndex = historyIndex - 1
      const previousState = JSON.parse(canvasHistory.current[previousIndex])

      await canvas.loadFromJSON(previousState)
      canvas.renderAll()
      setHistoryIndex(previousIndex)
      skipSave.current = false
    }
  }, [canUndo, canvas, historyIndex])

  const redo = useCallback(async () => {
    if (canRedo() && canvas) {
      skipSave.current = true
      canvas.clear()
      canvas.renderAll()

      const nextIndex = historyIndex + 1
      const nextState = JSON.parse(canvasHistory.current[nextIndex])

      await canvas.loadFromJSON(nextState)
      canvas.renderAll()
      setHistoryIndex(nextIndex)
      skipSave.current = false
    }
  }, [canvas, historyIndex, canRedo])

  return {
    save,
    generateThumbnail,
    canUndo,
    canRedo,
    undo,
    redo,
    setHistoryIndex,
    canvasHistory,
  }
}
