interface DefaultCanvasOptions {
  width?: number
  height?: number
}

export function createDefaultCanvasContent(options: DefaultCanvasOptions = {}) {
  const { width = 900, height = 1200 } = options

  return {
    version: "6.0.0",
    objects: [
      {
        type: "Rect",
        version: "6.0.0",
        originX: "left",
        originY: "top",
        left: 0,
        top: 0,
        width,
        height,
        fill: "white",
        stroke: null,
        strokeWidth: 0,
        selectable: false,
        hasControls: false,
        name: "clip",
        shadow: {
          color: "rgba(0,0,0,0.8)",
          blur: 5,
          offsetX: 0,
          offsetY: 0,
        },
      },
    ],
  }
}

export const DEFAULT_CANVAS_CONTENT = createDefaultCanvasContent()

export const DEFAULT_CANVAS_DIMENSIONS = {
  width: 900,
  height: 1200,
} as const
