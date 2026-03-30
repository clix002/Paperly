import { filters } from "fabric"
import { nanoid } from "nanoid"
import type { RGBColor } from "react-color"

// biome-ignore lint/suspicious/noExplicitAny: Fabric.js objects don't have proper TypeScript types for JSON serialization
export function transformText(objects: any) {
  if (!objects) return

  for (const item of objects) {
    if (item.objects) {
      transformText(item.objects)
    }
  }
}

export function downloadFile(file: string, type: string, name?: string) {
  const anchorElement = document.createElement("a")

  anchorElement.href = file
  anchorElement.download = `${name || nanoid()}.${type}`
  document.body.appendChild(anchorElement)
  anchorElement.click()
  anchorElement.remove()
}

export function isTextType(type: string | undefined) {
  return type === "Text" || type === "IText" || type === "Textbox"
}

export function rgbaObjectToString(rgba: RGBColor | "transparent") {
  if (rgba === "transparent") {
    return "rgba(0,0,0,0)"
  }

  const alpha = rgba.a ?? 1

  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha})`
}

/**
 * Creates a Fabric.js image filter by name.
 * In v7 all filter classes are direct named exports from 'fabric'.
 */
export const createFilter = (value: string) => {
  switch (value) {
    case "greyscale":
      return new filters.Grayscale()
    case "sepia":
      return new filters.Sepia()
    case "contrast":
      return new filters.Contrast({ contrast: 0.3 })
    case "brightness":
      return new filters.Brightness({ brightness: 0.8 })
    case "pixelate":
      return new filters.Pixelate()
    case "invert":
      return new filters.Invert()
    case "blur":
      return new filters.Blur()
    case "sharpen":
      return new filters.Convolute({
        matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
      })
    case "emboss":
      return new filters.Convolute({
        matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1],
      })
    case "removecolor":
      return new filters.RemoveColor({
        threshold: 0.2,
        distance: 0.5,
      })
    case "blacknwhite":
      return new filters.BlackWhite()
    case "vibrance":
      return new filters.Vibrance({
        vibrance: 1,
      })
    case "blendcolor":
      return new filters.BlendColor({
        color: "#00ff00",
        mode: "multiply",
      })
    case "huerotate":
      return new filters.HueRotation({
        rotation: 0.5,
      })
    case "resize":
      return new filters.Resize()
    case "gamma":
      return new filters.Gamma({
        gamma: [1, 0.5, 2.1] as [number, number, number],
      })
    case "saturation":
      return new filters.Saturation({
        saturation: 0.7,
      })
    default:
      return undefined
  }
}
