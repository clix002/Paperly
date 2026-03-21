import { type Canvas, FabricObject, type Textbox } from "fabric"
import * as material from "material-colors"
import type React from "react"

declare module "fabric" {
  interface FabricObject {
    name?: string
  }
  interface SerializedObjectProps {
    name?: string
  }
}

FabricObject.customProperties = ["name"]

export interface NamedFabricObject extends FabricObject {
  name?: string
}

export enum EditorType {
  /** HR: crear nuevo documento (todas las herramientas + Templates) */
  Create = "create",
  /** HR: editar documento existente (todas las herramientas, sin Templates) */
  Document = "document",
  /** Worker: firmar documento (solo sidebar Firmas) */
  Sign = "sign",
  /** Worker: solo lectura (sin edición, canvas read-only) */
  View = "view",
}

export const EditorTypeLabels: Record<EditorType, string> = {
  [EditorType.Create]: "Nuevo documento",
  [EditorType.Document]: "Documento",
  [EditorType.Sign]: "Firmar",
  [EditorType.View]: "Solo lectura",
} as const

/** Modos de HR con edición completa */
export function isEditableEditorType(type?: EditorType): boolean {
  return type === EditorType.Create || type === EditorType.Document
}

/** Modos de Worker (restringidos) */
export function isWorkerEditorType(type?: EditorType): boolean {
  return type === EditorType.Sign || type === EditorType.View
}

export const JSON_KEYS = [
  "name",
  "gradientAngle",
  "selectable",
  "hasControls",
  "linkData",
  "editable",
  "extensionType",
  "extension",
]

export const filters = [
  "none",
  "polaroid",
  "sepia",
  "kodachrome",
  "contrast",
  "brightness",
  "greyscale",
  "brownie",
  "vintage",
  "technicolor",
  "pixelate",
  "invert",
  "blur",
  "sharpen",
  "emboss",
  "removecolor",
  "blacknwhite",
  "vibrance",
  "blendcolor",
  "huerotate",
  "resize",
  "saturation",
  "gamma",
]

export const fonts = [
  "Arial",
  "Arial Black",
  "Verdana",
  "Helvetica",
  "Tahoma",
  "Trebuchet MS",
  "Times New Roman",
  "Georgia",
  "Garamond",
  "Courier New",
  "Brush Script MT",
  "Palatino",
  "Bookman",
  "Comic Sans MS",
  "Impact",
  "Lucida Sans Unicode",
  "Geneva",
  "Lucida Console",
]

export const selectionDependentTools = [
  "fill",
  "font",
  "filter",
  "opacity",
  "remove-bg",
  "stroke-color",
  "stroke-width",
]

export const colors = [
  material.red["500"],
  material.pink["500"],
  material.purple["500"],
  material.deepPurple["500"],
  material.indigo["500"],
  material.blue["500"],
  material.lightBlue["500"],
  material.cyan["500"],
  material.teal["500"],
  material.green["500"],
  material.lightGreen["500"],
  material.lime["500"],
  material.yellow["500"],
  material.amber["500"],
  material.orange["500"],
  material.deepOrange["500"],
  material.brown["500"],
  material.blueGrey["500"],
  "transparent",
]

export type ActiveTool =
  | "select"
  | "shapes"
  | "text"
  | "images"
  | "draw"
  | "fill"
  | "stroke-color"
  | "stroke-width"
  | "font"
  | "opacity"
  | "filter"
  | "settings"
  | "ai"
  | "remove-bg"
  | "templates"
  | "signatures"

export const FILL_COLOR = "rgba(0,0,0,1)"
export const STROKE_COLOR = "rgba(0,0,0,1)"
export const STROKE_WIDTH = 2
export const STROKE_DASH_ARRAY = []
export const FONT_FAMILY = "Arial"
export const FONT_SIZE = 32
export const FONT_WEIGHT = 400

export const CIRCLE_OPTIONS = {
  radius: 80,
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
}

export const RECTANGLE_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 200,
  height: 150,
  angle: 0,
}

export const DIAMOND_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 200,
  height: 200,
  angle: 0,
}

export const TRIANGLE_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 200,
  height: 180,
  angle: 0,
}

export const TEXT_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  fontSize: FONT_SIZE,
  fontFamily: FONT_FAMILY,
}

export interface EditorHookProps {
  defaultState?: string
  defaultWidth?: number
  defaultHeight?: number
  clearSelectionCallback?: () => void
  saveCallback?: (values: { json: string; height: number; width: number }) => void
  onThumbnailGenerated?: (url: string) => Promise<void>
  canvasBgRef?: React.RefObject<string>
}

export type BuildEditorProps = {
  canvasBgRef?: React.RefObject<string>
  undo: () => void
  redo: () => void
  save: (skip?: boolean) => Promise<void>
  generateThumbnail: () => Promise<void>
  canUndo: () => boolean
  canRedo: () => boolean
  autoZoom: () => void
  setManualZoom: (value: boolean) => void
  copy: () => void
  paste: () => void
  canvas: Canvas
  container: HTMLDivElement | null
  fillColor: string
  strokeColor: string
  strokeWidth: number
  selectedObjects: FabricObject[]
  strokeDashArray: number[]
  fontFamily: string
  setStrokeDashArray: (value: number[]) => void
  setFillColor: (value: string) => void
  setStrokeColor: (value: string) => void
  setStrokeWidth: (value: number) => void
  setFontFamily: (value: string) => void
  changePage: (index: number) => void
  activePageIndex: number
  pagesArrayRef: { current: unknown[] }
  addPage: () => void
  deletePage: (index: number) => void
  setActivePageIndex: (index: number) => void
  activePageIndexRef: { current: number }
}

export interface Editor {
  getJson: () => string
  save: () => Promise<void>
  savePdf: (name?: string) => void
  saveJson: (name?: string) => void
  generateThumbnail: () => Promise<void>
  loadJson: (json: string | object) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  autoZoom: () => void
  resetZoom: () => void
  zoomIn: () => void
  zoomOut: () => void
  getWorkspace: () => FabricObject | undefined
  changeBackground: (value: string) => void
  changeSize: (value: { width: number; height: number }) => void
  enableDrawingMode: () => void
  disableDrawingMode: () => void
  onCopy: () => void
  onPaste: () => void
  changeImageFilter: (value: string) => void
  addImage: (value: string) => void
  delete: () => void
  changeFontSize: (value: number) => void
  getActiveFontSize: () => number
  changeTextAlign: (value: string) => void
  getActiveTextAlign: () => string
  changeFontUnderline: (value: boolean) => void
  getActiveFontUnderline: () => boolean
  changeFontLinethrough: (value: boolean) => void
  getActiveFontLinethrough: () => boolean
  changeFontStyle: (value: string) => void
  getActiveFontStyle: () => string
  changeFontWeight: (value: number) => void
  getActiveFontWeight: () => number
  getActiveFontFamily: () => string
  changeFontFamily: (value: string) => void
  addText: (value: string, options?: Partial<Textbox>) => void
  getActiveOpacity: () => number
  changeOpacity: (value: number) => void
  bringForward: () => void
  sendBackwards: () => void
  changeStrokeWidth: (value: number) => void
  changeFillColor: (value: string) => void
  changeStrokeColor: (value: string) => void
  changeStrokeDashArray: (value: number[]) => void
  addCircle: () => void
  addSoftRectangle: () => void
  addRectangle: () => void
  addTriangle: () => void
  addInverseTriangle: () => void
  addDiamond: () => void
  canvas: Canvas
  getActiveFillColor: () => string
  getActiveStrokeColor: () => string
  getActiveStrokeWidth: () => number
  getActiveStrokeDashArray: () => number[]
  selectedObjects: FabricObject[]
  // Multi-page support
  addPage: () => void
  deletePage: (index: number) => void
  changePage: (index: number) => void
  activePageIndex: number
  pagesArrayRef: { current: unknown[] }
}

export interface Page {
  id: string
  json: string
  thumbnail?: string
}
