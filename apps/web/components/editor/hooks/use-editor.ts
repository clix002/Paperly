import {
  type Canvas,
  Circle,
  FabricImage,
  FabricObject,
  iMatrix,
  PencilBrush,
  Polygon,
  Rect,
  Shadow,
  Textbox,
  Triangle,
} from "fabric"

import { useCallback, useMemo, useRef, useState } from "react"
import {
  type BuildEditorProps,
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  type Editor,
  type EditorHookProps,
  FILL_COLOR,
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  RECTANGLE_OPTIONS,
  STROKE_COLOR,
  STROKE_DASH_ARRAY,
  STROKE_WIDTH,
  TEXT_OPTIONS,
  TRIANGLE_OPTIONS,
} from "../types"
import { createFilter, downloadFile, isTextType, transformText } from "../utils"
import { createDefaultCanvasContent, DEFAULT_CANVAS_DIMENSIONS } from "../utils/default-content"
import { useAutoResize } from "./use-auto-resize"
import { useCanvasEvents } from "./use-canvas-events"
import { useClipboard } from "./use-clipboard"
import { useHistory } from "./use-history"
import { useHotkeys } from "./use-hotkeys"
import { useLoadState } from "./use-load-state"

const CANVAS_BG = "#e5e5e5"

async function loadPageIntoCanvas(canvas: Canvas, pageData: object) {
  await canvas.loadFromJSON(pageData)
  canvas.backgroundColor = CANVAS_BG
}

function findWorkspace(canvas: Canvas) {
  return canvas
    .getObjects()
    .find((obj) => (obj as FabricObject & { name?: string }).name === "clip")
}

function applyZoom(canvas: Canvas, container: HTMLDivElement, workspace: Rect, zoomRatio: number) {
  const workspaceWidth = workspace.width || 900
  const workspaceHeight = workspace.height || 1200
  const workspaceCenter = workspace.getCenterPoint()
  const padding = 100

  const canvasWidth = Math.max(container.offsetWidth, workspaceWidth * zoomRatio + padding)
  const canvasHeight = Math.max(container.offsetHeight, workspaceHeight * zoomRatio + padding)

  canvas.setDimensions({ width: canvasWidth, height: canvasHeight })

  canvas.setViewportTransform([
    zoomRatio,
    0,
    0,
    zoomRatio,
    canvasWidth / 2 - workspaceCenter.x * zoomRatio,
    canvasHeight / 2 - workspaceCenter.y * zoomRatio,
  ])

  canvas.backgroundColor = CANVAS_BG
  canvas.renderAll()

  container.scrollLeft = (canvasWidth - container.clientWidth) / 2
  container.scrollTop = (canvasHeight - container.clientHeight) / 2
}

const buildEditor = ({
  save,
  generateThumbnail,
  undo,
  redo,
  canRedo,
  canUndo,
  autoZoom,
  setManualZoom,
  copy,
  paste,
  canvas,
  container,
  fillColor,
  fontFamily,
  setFontFamily,
  setFillColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  selectedObjects,
  strokeDashArray,
  setStrokeDashArray,
  changePage,
  activePageIndex,
  pagesArrayRef,
  addPage,
  deletePage,
  setActivePageIndex,
  activePageIndexRef,
}: BuildEditorProps): Editor => {
  const getAllPages = () => {
    const currentPage = canvas.toJSON()
    const pages = [...pagesArrayRef.current]
    pages[activePageIndexRef.current] = currentPage
    return pages.length > 0 ? pages : [currentPage]
  }

  const savePdf = async (name?: string) => {
    const { downloadPdfFromContentJson } = await import("@/components/editor/utils/pdf-generator")

    const fallback = "documento"
    const raw = (name || fallback).toString()
    const sanitized =
      raw
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[^\p{L}\p{N}\-_. ]/gu, "")
        .slice(0, 120)
        .replace(/^\.+$/, fallback) || fallback

    await downloadPdfFromContentJson(getAllPages(), sanitized)
    autoZoom()
  }

  const saveJson = (name?: string) => {
    const pages = getAllPages()
    for (const page of pages) {
      transformText((page as Record<string, unknown>).objects)
    }
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(pages, null, "\t")
    )}`
    downloadFile(fileString, "json", name || "documento")
  }

  const loadJson = async (json: string | object) => {
    const data =
      typeof json === "object" && json !== null
        ? json
        : typeof json === "string"
          ? (() => {
              try {
                return JSON.parse(json)
              } catch {
                return null
              }
            })()
          : null

    if (!data) return

    const pagesArray: unknown[] = Array.isArray(data) ? data : [data]
    pagesArrayRef.current = pagesArray
    setActivePageIndex(0)
    activePageIndexRef.current = 0

    const firstPage = pagesArray[0]
    if (!firstPage || typeof firstPage !== "object") return

    await loadPageIntoCanvas(canvas, firstPage)
    autoZoom()
    save()
  }

  const getWorkspace = () => findWorkspace(canvas)

  const center = (object: FabricObject) => {
    const workspace = getWorkspace()
    const centerPoint = workspace?.getCenterPoint()

    if (!centerPoint) return

    canvas._centerObject(object, centerPoint)
  }

  const addToCanvas = (object: FabricObject) => {
    center(object)
    canvas.add(object)
    canvas.setActiveObject(object)
  }

  return {
    getJson: () => JSON.stringify(getAllPages()),
    save,
    savePdf,
    saveJson,
    loadJson,
    generateThumbnail,
    canUndo,
    canRedo,
    autoZoom,
    resetZoom: () => {
      setManualZoom(false)
      autoZoom()
    },
    getWorkspace,
    zoomIn: () => {
      const workspace = getWorkspace() as Rect
      if (!workspace || !container) return

      setManualZoom(true)

      let zoomRatio = canvas.getZoom()
      zoomRatio += 0.2
      if (zoomRatio > 5) zoomRatio = 5

      applyZoom(canvas, container, workspace, zoomRatio)
    },
    zoomOut: () => {
      const workspace = getWorkspace() as Rect
      if (!workspace || !container) return

      let zoomRatio = canvas.getZoom()
      zoomRatio -= 0.2

      if (zoomRatio < 0.2) {
        setManualZoom(false)
        autoZoom()
        return
      }

      setManualZoom(true)

      applyZoom(canvas, container, workspace, zoomRatio)
    },
    changeSize: (value: { width: number; height: number }) => {
      const workspace = getWorkspace()

      workspace?.set(value)
      autoZoom()
      save()
    },
    changeBackground: (value: string) => {
      const workspace = getWorkspace()
      workspace?.set({ fill: value })
      canvas.renderAll()
      save()
    },
    enableDrawingMode: () => {
      canvas.discardActiveObject()
      canvas.renderAll()
      canvas.isDrawingMode = true
      canvas.freeDrawingBrush = new PencilBrush(canvas)
      canvas.freeDrawingBrush.width = strokeWidth
      canvas.freeDrawingBrush.color = strokeColor
    },
    disableDrawingMode: () => {
      canvas.isDrawingMode = false
    },
    onUndo: () => undo(),
    onRedo: () => redo(),
    onCopy: () => copy(),
    onPaste: () => paste(),
    changeImageFilter: (value: string) => {
      const objects = canvas.getActiveObjects()
      for (const object of objects) {
        if (object.type === "image") {
          const imageObject = object as FabricImage

          const effect = createFilter(value)

          imageObject.filters = effect ? [effect] : []
          imageObject.applyFilters()
          canvas.renderAll()
        }
      }
    },
    addImage: async (value: string) => {
      const image = await FabricImage.fromURL(value, { crossOrigin: "anonymous" })
      const workspace = getWorkspace()

      image.scaleToWidth(workspace?.width || 0)
      image.scaleToHeight(workspace?.height || 0)

      addToCanvas(image)
    },
    delete: () => {
      for (const object of canvas.getActiveObjects()) {
        canvas.remove(object)
      }
      canvas.discardActiveObject()
      canvas.renderAll()
    },
    addText: (value, options) => {
      const object = new Textbox(value, {
        ...TEXT_OPTIONS,
        fill: fillColor,
        ...options,
      })

      addToCanvas(object)
    },
    getActiveOpacity: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return 1
      }

      const value = selectedObject.get("opacity") || 1

      return value
    },
    changeFontSize: (value: number) => {
      for (const object of canvas.getActiveObjects()) {
        if (isTextType(object.type)) {
          ;(object as Textbox).set({ fontSize: value })
        }
      }
      canvas.renderAll()
      save()
    },
    getActiveFontSize: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return FONT_SIZE
      }

      const value = (selectedObject as Textbox).get("fontSize") || FONT_SIZE

      return value
    },
    changeTextAlign: (value: string) => {
      for (const object of canvas.getActiveObjects()) {
        if (isTextType(object.type)) {
          ;(object as Textbox).set({ textAlign: value })
        }
      }
      canvas.renderAll()
      save()
    },
    getActiveTextAlign: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return "left"
      }

      const value = (selectedObject as Textbox).get("textAlign") || "left"

      return value
    },
    changeFontUnderline: (value: boolean) => {
      for (const object of canvas.getActiveObjects()) {
        if (isTextType(object.type)) {
          ;(object as Textbox).set({ underline: value })
        }
      }
      canvas.renderAll()
      save()
    },
    getActiveFontUnderline: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return false
      }

      const value = (selectedObject as Textbox).get("underline") || false

      return value
    },
    changeFontLinethrough: (value: boolean) => {
      for (const object of canvas.getActiveObjects()) {
        if (isTextType(object.type)) {
          ;(object as Textbox).set({ linethrough: value })
        }
      }
      canvas.renderAll()
      save()
    },
    getActiveFontLinethrough: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return false
      }

      const value = (selectedObject as Textbox).get("linethrough") || false

      return value
    },
    changeFontStyle: (value: string) => {
      for (const object of canvas.getActiveObjects()) {
        if (isTextType(object.type)) {
          ;(object as Textbox).set({ fontStyle: value })
        }
      }
      canvas.renderAll()
      save()
    },
    getActiveFontStyle: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return "normal"
      }

      const value = (selectedObject as Textbox).get("fontStyle") || "normal"

      return value
    },
    changeFontWeight: (value: number) => {
      for (const object of canvas.getActiveObjects()) {
        if (isTextType(object.type)) {
          ;(object as Textbox).set({ fontWeight: value })
        }
      }
      canvas.renderAll()
      save()
    },
    changeOpacity: (value: number) => {
      for (const object of canvas.getActiveObjects()) {
        object.set({ opacity: value })
      }
      canvas.renderAll()
      save()
    },
    bringForward: () => {
      for (const object of canvas.getActiveObjects()) {
        canvas.bringObjectForward(object)
      }

      canvas.renderAll()

      const workspace = getWorkspace()
      if (workspace) canvas.sendObjectToBack(workspace)
      save()
    },
    sendBackwards: () => {
      for (const object of canvas.getActiveObjects()) {
        canvas.sendObjectBackwards(object)
      }

      canvas.renderAll()
      const workspace = getWorkspace()
      if (workspace) canvas.sendObjectToBack(workspace)
      save()
    },
    changeFontFamily: (value: string) => {
      setFontFamily(value)
      for (const object of canvas.getActiveObjects()) {
        if (isTextType(object.type)) {
          ;(object as Textbox).set({ fontFamily: value })
        }
      }
      canvas.renderAll()
      save()
    },
    changeFillColor: (value: string) => {
      setFillColor(value)
      for (const object of canvas.getActiveObjects()) {
        object.set({ fill: value })
      }
      canvas.renderAll()
      save()
    },
    changeStrokeColor: (value: string) => {
      setStrokeColor(value)
      for (const object of canvas.getActiveObjects()) {
        // Text types don't have stroke
        if (isTextType(object.type)) {
          object.set({ fill: value })
          continue
        }

        object.set({ stroke: value })
      }
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = value
      }
      canvas.renderAll()
      save()
    },
    changeStrokeWidth: (value: number) => {
      setStrokeWidth(value)
      for (const object of canvas.getActiveObjects()) {
        object.set({ strokeWidth: value })
      }
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = value
      }
      canvas.renderAll()
      save()
    },
    changeStrokeDashArray: (value: number[]) => {
      setStrokeDashArray(value)
      for (const object of canvas.getActiveObjects()) {
        object.set({ strokeDashArray: value })
      }
      canvas.renderAll()
      save()
    },
    addCircle: () => {
      const object = new Circle({
        ...CIRCLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      })

      addToCanvas(object)
    },
    addSoftRectangle: () => {
      const object = new Rect({
        ...RECTANGLE_OPTIONS,
        rx: 50,
        ry: 50,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      })

      addToCanvas(object)
    },
    addRectangle: () => {
      const object = new Rect({
        ...RECTANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      })

      addToCanvas(object)
    },
    addTriangle: () => {
      const object = new Triangle({
        ...TRIANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      })

      addToCanvas(object)
    },
    addInverseTriangle: () => {
      const HEIGHT = TRIANGLE_OPTIONS.height
      const WIDTH = TRIANGLE_OPTIONS.width

      const object = new Polygon(
        [
          { x: 0, y: 0 },
          { x: WIDTH, y: 0 },
          { x: WIDTH / 2, y: HEIGHT },
        ],
        {
          ...TRIANGLE_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      )

      addToCanvas(object)
    },
    addDiamond: () => {
      const HEIGHT = DIAMOND_OPTIONS.height
      const WIDTH = DIAMOND_OPTIONS.width

      const object = new Polygon(
        [
          { x: WIDTH / 2, y: 0 },
          { x: WIDTH, y: HEIGHT / 2 },
          { x: WIDTH / 2, y: HEIGHT },
          { x: 0, y: HEIGHT / 2 },
        ],
        {
          ...DIAMOND_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      )
      addToCanvas(object)
    },
    canvas,
    getActiveFontWeight: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return FONT_WEIGHT
      }

      const value = (selectedObject as Textbox).get("fontWeight") || FONT_WEIGHT

      return value
    },
    getActiveFontFamily: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return fontFamily
      }

      const value = (selectedObject as Textbox).get("fontFamily") || fontFamily

      return value
    },
    getActiveFillColor: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return fillColor
      }

      const value = selectedObject.get("fill") || fillColor

      return value as string
    },
    getActiveStrokeColor: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return strokeColor
      }

      const value = selectedObject.get("stroke") || strokeColor

      return value
    },
    getActiveStrokeWidth: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return strokeWidth
      }

      const value = selectedObject.get("strokeWidth") || strokeWidth

      return value
    },
    getActiveStrokeDashArray: () => {
      const selectedObject = selectedObjects[0]

      if (!selectedObject) {
        return strokeDashArray
      }

      const value = selectedObject.get("strokeDashArray") || strokeDashArray

      return value
    },
    selectedObjects,
    addPage,
    deletePage,
    changePage,
    activePageIndex,
    pagesArrayRef,
  }
}

export const useEditor = ({
  defaultState,
  defaultHeight,
  defaultWidth,
  clearSelectionCallback,
  saveCallback,
  onThumbnailGenerated,
}: EditorHookProps) => {
  const initialState = useRef(defaultState)
  const initialWidth = useRef(defaultWidth)
  const initialHeight = useRef(defaultHeight)

  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [selectedObjects, setSelectedObjects] = useState<FabricObject[]>([])

  const [fontFamily, setFontFamily] = useState(FONT_FAMILY)
  const [fillColor, setFillColor] = useState(FILL_COLOR)
  const [strokeColor, setStrokeColor] = useState(STROKE_COLOR)
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH)
  const [strokeDashArray, setStrokeDashArray] = useState<number[]>(STROKE_DASH_ARRAY)

  const pagesArrayRef = useRef<unknown[]>([])
  const [activePageIndex, setActivePageIndex] = useState(0)
  const activePageIndexRef = useRef(0)
  const isPageChanging = useRef(false)

  const [isLoaded, setIsLoaded] = useState(false)

  // Mantener el ref sincronizado con el state
  activePageIndexRef.current = activePageIndex

  const handleSave = useCallback(
    (values: { json: string; height: number; width: number }) => {
      if (isPageChanging.current) {
        return
      }

      const currentPageData = JSON.parse(values.json)
      const pagesArray = [...pagesArrayRef.current]

      // Usar el ref para tener siempre el indice actual correcto
      const currentIndex = activePageIndexRef.current
      pagesArray[currentIndex] = currentPageData

      pagesArrayRef.current = pagesArray

      const allPagesJson = JSON.stringify(pagesArray)
      saveCallback?.({
        json: allPagesJson,
        height: values.height,
        width: values.width,
      })
    },
    [saveCallback]
  )

  const { save, generateThumbnail, canRedo, canUndo, undo, redo, canvasHistory, setHistoryIndex } =
    useHistory({
      canvas,
      saveCallback: handleSave,
      onThumbnailGenerated,
    })

  const { copy, paste } = useClipboard({ canvas })

  const { autoZoom, setManualZoom } = useAutoResize({
    canvas,
    container,
  })

  useCanvasEvents({
    save: () => {
      if (!isLoaded || isPageChanging.current) {
        return
      }
      save()
    },
    canvas,
    setSelectedObjects,
    clearSelectionCallback,
  })

  useHotkeys({
    undo,
    redo,
    copy,
    paste,
    save,
    canvas,
  })

  useLoadState({
    canvas,
    autoZoom,
    initialState,
    canvasHistory,
    setHistoryIndex,
    pagesArrayRef,
    setActivePageIndex,
    onLoadComplete: () => {
      setIsLoaded(true)
    },
  })

  const addPage = useCallback(async () => {
    if (!canvas) return

    isPageChanging.current = true

    // Guardar la pagina actual en el array (usar ref para indice correcto)
    const currentPageData = canvas.toJSON()
    const pagesArray = [...pagesArrayRef.current]
    pagesArray[activePageIndexRef.current] = currentPageData

    // Crear nueva pagina con contenido por defecto
    const newPageContent = createDefaultCanvasContent({
      width: initialWidth.current,
      height: initialHeight.current,
    })
    pagesArray.push(newPageContent)

    // Actualizar el ref (fuente de verdad)
    pagesArrayRef.current = pagesArray

    // Cambiar a la nueva pagina
    const newPageIndex = pagesArray.length - 1

    if (container) {
      canvas.setDimensions({ width: container.offsetWidth, height: container.offsetHeight })
    }
    // Resetear el viewport transform
    canvas.setViewportTransform([...iMatrix])

    // Limpiar el canvas antes de cargar para evitar conflictos
    canvas.clear()

    // Cargar la nueva pagina en el canvas
    await loadPageIntoCanvas(canvas, newPageContent)

    // Actualizar el history con el nuevo estado
    const newState = JSON.stringify(canvas.toJSON())
    canvasHistory.current = [newState]
    setHistoryIndex(0)

    // Aplicar autoZoom despues de cargar
    autoZoom()

    // Esperar un momento para que autoZoom termine y luego actualizar el history
    setTimeout(() => {
      const finalState = JSON.stringify(canvas.toJSON())
      canvasHistory.current = [finalState]
      setHistoryIndex(0)
      setActivePageIndex(newPageIndex)
      isPageChanging.current = false

      // Persistir al servidor despues de agregar pagina
      const workspace = findWorkspace(canvas)
      saveCallback?.({
        json: JSON.stringify(pagesArrayRef.current),
        height: workspace?.height || 1200,
        width: workspace?.width || 900,
      })
    }, 200)
  }, [canvas, autoZoom, container, canvasHistory, setHistoryIndex, saveCallback])

  const deletePage = useCallback(
    async (index: number) => {
      const pagesArray = [...pagesArrayRef.current]
      pagesArray.splice(index, 1)

      if (pagesArray.length === 0) {
        const defaultPage = createDefaultCanvasContent({
          width: initialWidth.current,
          height: initialHeight.current,
        })
        pagesArray.push(defaultPage)
      }

      // Actualizar el ref (fuente de verdad)
      pagesArrayRef.current = pagesArray
      setActivePageIndex(0)

      // Cargar la primera pagina en el canvas
      if (pagesArray[0] && canvas) {
        await loadPageIntoCanvas(canvas, pagesArray[0])
        autoZoom()
      }
    },
    [canvas, autoZoom]
  )

  const changePage = useCallback(
    async (index: number) => {
      if (!canvas || index === activePageIndexRef.current) return

      isPageChanging.current = true

      // Guardar la pagina actual en el array (usar ref para indice correcto)
      const currentPageData = canvas.toJSON()
      const pagesArray = [...pagesArrayRef.current]
      pagesArray[activePageIndexRef.current] = currentPageData
      pagesArrayRef.current = pagesArray

      // Persistir al servidor antes de cambiar de pagina
      const workspace = findWorkspace(canvas)
      saveCallback?.({
        json: JSON.stringify(pagesArrayRef.current),
        height: workspace?.height || 1200,
        width: workspace?.width || 900,
      })

      if (container) {
        canvas.setDimensions({ width: container.offsetWidth, height: container.offsetHeight })
      }
      // Resetear el viewport transform
      canvas.setViewportTransform([...iMatrix])

      // Resolver contenido de la pagina (existente o nueva vacia)
      const existing = pagesArray[index]
      const isValid = existing && typeof existing === "object"
      const pageContent: object = isValid
        ? existing
        : createDefaultCanvasContent({ width: initialWidth.current, height: initialHeight.current })

      if (!isValid) {
        const currentPagesArray = [...pagesArrayRef.current]
        currentPagesArray[index] = pageContent
        pagesArrayRef.current = currentPagesArray
      }

      canvas.clear()
      await loadPageIntoCanvas(canvas, pageContent)
      autoZoom()

      setTimeout(() => {
        const finalState = JSON.stringify(canvas.toJSON())
        canvasHistory.current = [finalState]
        setHistoryIndex(0)
        setActivePageIndex(index)
        isPageChanging.current = false
      }, 200)
    },
    [canvas, autoZoom, container, canvasHistory, setHistoryIndex, saveCallback]
  )

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        save,
        generateThumbnail,
        undo,
        redo,
        canUndo,
        canRedo,
        autoZoom,
        setManualZoom,
        copy,
        paste,
        canvas,
        container,
        fillColor,
        strokeWidth,
        strokeColor,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        strokeDashArray,
        selectedObjects,
        setStrokeDashArray,
        fontFamily,
        setFontFamily,
        changePage,
        activePageIndex,
        pagesArrayRef,
        addPage,
        deletePage,
        setActivePageIndex,
        activePageIndexRef,
      })
    }

    return undefined
  }, [
    canRedo,
    canUndo,
    undo,
    redo,
    save,
    generateThumbnail,
    autoZoom,
    setManualZoom,
    copy,
    paste,
    canvas,
    container,
    fillColor,
    strokeWidth,
    strokeColor,
    selectedObjects,
    strokeDashArray,
    fontFamily,
    addPage,
    deletePage,
    changePage,
    activePageIndex,
  ])

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: Canvas
      initialContainer: HTMLDivElement
    }) => {
      FabricObject.ownDefaults.cornerColor = "#FFF"
      FabricObject.ownDefaults.cornerStyle = "circle"
      FabricObject.ownDefaults.borderColor = "#3b82f6"
      FabricObject.ownDefaults.borderScaleFactor = 1.5
      FabricObject.ownDefaults.transparentCorners = false
      FabricObject.ownDefaults.borderOpacityWhenMoving = 1
      FabricObject.ownDefaults.cornerStrokeColor = "#3b82f6"

      const initialWorkspace = new Rect({
        width: initialWidth.current ?? DEFAULT_CANVAS_DIMENSIONS.width,
        height: initialHeight.current ?? DEFAULT_CANVAS_DIMENSIONS.height,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        shadow: new Shadow({
          color: "rgba(0,0,0,0.4)",
          blur: 15,
          offsetX: 2,
          offsetY: 2,
        }),
      })

      initialCanvas.setDimensions({
        width: initialContainer.offsetWidth,
        height: initialContainer.offsetHeight,
      })

      initialCanvas.backgroundColor = CANVAS_BG

      initialCanvas.add(initialWorkspace)
      initialCanvas.centerObject(initialWorkspace)

      initialCanvas.requestRenderAll()

      setCanvas(initialCanvas)
      setContainer(initialContainer)

      const currentState = JSON.stringify(initialCanvas.toJSON())
      canvasHistory.current = [currentState]
      setHistoryIndex(0)
    },
    [canvasHistory, setHistoryIndex]
  )

  return { init, editor }
}
