import { type Canvas, util } from "fabric"
import { useCallback, useEffect, useRef } from "react"

import type { NamedFabricObject } from "../types"

interface UseAutoResizeProps {
  canvas: Canvas | null
  container: HTMLDivElement | null
}

export const useAutoResize = ({ canvas, container }: UseAutoResizeProps) => {
  const isManualZoom = useRef(false)

  const setManualZoom = useCallback((value: boolean) => {
    isManualZoom.current = value
  }, [])

  const autoZoom = useCallback(() => {
    if (!canvas || !container) return
    if (isManualZoom.current) return

    const width = container.offsetWidth
    const height = container.offsetHeight

    canvas.setDimensions({ width, height })

    const localWorkspace = canvas
      .getObjects()
      .find((object) => (object as NamedFabricObject).name === "clip")

    if (!localWorkspace) return

    // Fit workspace to 85% of container
    const scale = util.findScaleToFit(localWorkspace, { width, height })
    const zoom = 0.85 * scale

    const workspaceCenter = localWorkspace.getCenterPoint()

    // Center the workspace in the canvas
    canvas.setViewportTransform([
      zoom,
      0,
      0,
      zoom,
      width / 2 - workspaceCenter.x * zoom,
      height / 2 - workspaceCenter.y * zoom,
    ])

    canvas.backgroundColor = "#e5e5e5"
    canvas.requestRenderAll()
  }, [canvas, container])

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null

    if (canvas && container) {
      resizeObserver = new ResizeObserver(() => {
        autoZoom()
      })

      resizeObserver.observe(container)
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [canvas, container, autoZoom])

  return { autoZoom, setManualZoom }
}
