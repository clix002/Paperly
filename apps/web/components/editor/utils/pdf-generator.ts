import { type FabricObject, StaticCanvas } from "fabric"

const CANVAS_WIDTH = 900
const CANVAS_HEIGHT = 1200

function sanitizeFileName(name: string): string {
  const fallback = "documento"
  const raw = (name || fallback).toString()
  return (
    raw
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^\p{L}\p{N}\-_. ]/gu, "")
      .slice(0, 120)
      .replace(/^\.+$/, fallback) || fallback
  )
}

/**
 * Renderiza una pagina de contentJson a un data URL.
 * Usa getCoords() de Fabric v7 para obtener la esquina top-left del clip
 * sin depender de originX/originY (deprecados).
 */
async function renderPageToDataUrl(pageJson: unknown): Promise<string> {
  const canvas = new StaticCanvas(undefined, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  })

  await canvas.loadFromJSON(pageJson as Record<string, unknown>)
  canvas.renderAll()

  await new Promise((resolve) => setTimeout(resolve, 300))
  canvas.renderAll()

  const clip = canvas
    .getObjects()
    .find((obj: FabricObject & { name?: string }) => obj.name === "clip")

  const w = clip?.width ?? CANVAS_WIDTH
  const h = clip?.height ?? CANVAS_HEIGHT

  if (clip) {
    // getCoords() retorna [tl, tr, br, bl] — esquina top-left real sin depender de origin
    const [tl] = clip.getCoords()

    // Viewport transform desplaza la "cámara" al inicio del workspace
    canvas.setDimensions({ width: w, height: h })
    canvas.setViewportTransform([1, 0, 0, 1, -tl.x, -tl.y])
    canvas.renderAll()
  }

  const dataUrl = canvas.toDataURL({
    multiplier: 2,
    format: "png",
    quality: 1,
    width: w,
    height: h,
  })

  await canvas.dispose()
  return dataUrl
}

/**
 * Genera un Blob PDF desde el contentJson de un documento.
 * Soporta documentos multipagina (array de paginas).
 */
export async function generatePdfBlob(contentJson: unknown): Promise<Blob> {
  const pages = Array.isArray(contentJson) ? contentJson : [contentJson]

  const { jsPDF } = await import("jspdf")

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) {
      pdf.addPage()
    }

    const dataUrl = await renderPageToDataUrl(pages[i])

    pdf.addImage(dataUrl, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST")
  }

  return pdf.output("blob")
}

/**
 * Genera y descarga un PDF desde el contentJson de un documento.
 */
export async function downloadPdfFromContentJson(
  contentJson: unknown,
  documentName: string
): Promise<void> {
  if (typeof window === "undefined" || typeof window.document === "undefined") {
    throw new Error("Cannot generate PDF on the server")
  }

  const blob = await generatePdfBlob(contentJson)
  const sanitized = sanitizeFileName(documentName)

  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement("a")
  anchor.href = url
  anchor.download = `${sanitized}.pdf`
  window.document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
