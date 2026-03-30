import type { Canvas } from "fabric"
import { useEffect, useRef } from "react"

interface UseLoadStateProps {
  autoZoom: () => void
  canvas: Canvas | null
  initialState: { current: string | undefined }
  canvasHistory: { current: string[] }
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>
  pagesArrayRef: { current: unknown[] }
  setActivePageIndex: React.Dispatch<React.SetStateAction<number>>
  onLoadComplete?: () => void
}

export const useLoadState = ({
  canvas,
  autoZoom,
  initialState,
  canvasHistory,
  setHistoryIndex,
  pagesArrayRef,
  setActivePageIndex,
  onLoadComplete,
}: UseLoadStateProps) => {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !canvas) return
    initialized.current = true

    const data = (() => {
      try {
        return initialState?.current ? JSON.parse(initialState.current) : null
      } catch {
        return null
      }
    })()

    if (!data) {
      onLoadComplete?.()
      return
    }

    const pagesArray = Array.isArray(data) ? data : [data]
    pagesArrayRef.current = pagesArray

    const firstPage = pagesArray[0]
    if (!firstPage || typeof firstPage !== "object") {
      onLoadComplete?.()
      return
    }

    canvas.loadFromJSON(firstPage).then(() => {
      canvasHistory.current = [JSON.stringify(canvas.toJSON())]
      setHistoryIndex(0)
      setActivePageIndex(0)
      autoZoom()
      onLoadComplete?.()
    })
  }, [
    canvas,
    autoZoom,
    initialState,
    canvasHistory,
    setHistoryIndex,
    pagesArrayRef,
    setActivePageIndex,
    onLoadComplete,
  ])
}
