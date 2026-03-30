"use client"

import { useMutation, useQuery } from "@apollo/client/react"
import { Check, Eye, EyeOff, FileSignature, RotateCcw, Upload, X } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { MeDocument, SaveUserSignatureDocument } from "@/lib/apollo/generated/graphql"
import { cn } from "@/lib/utils"
import type { Editor } from "../types"

interface SignaturePanelProps {
  editor: Editor | undefined
  onSignComplete: (canvasJson: string) => Promise<void>
}

export const SignaturePanel = ({ editor, onSignComplete }: SignaturePanelProps) => {
  const { data: meData, loading: meLoading } = useQuery(MeDocument)
  const savedSignatureUrl = meData?.me?.signatureUrl ?? null

  const [saveUserSignature] = useMutation(SaveUserSignatureDocument, {
    refetchQueries: [{ query: MeDocument }],
  })

  // null = use saved signature if available; string = override with this dataUrl
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)
  const [saveForFuture, setSaveForFuture] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [signing, setSigning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // The active preview: uploaded takes priority, else fall back to saved profile signature
  const preview = uploadedPreview ?? savedSignatureUrl
  const usingProfileSignature = !uploadedPreview && !!savedSignatureUrl

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se aceptan imágenes (PNG, JPG, SVG)")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedPreview(e.target?.result as string)
      setPlaced(false)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handlePlace = () => {
    if (!preview || !editor) return
    editor.addImage(preview)
    setPlaced(true)
    toast.success("Firma colocada — arrástrala al lugar correcto")
  }

  const handlePlaceAgain = () => {
    if (!preview || !editor) return
    editor.addImage(preview)
    toast.info("Firma colocada nuevamente")
  }

  const handleSign = async () => {
    if (!placed || !password || !editor) return
    setSigning(true)
    try {
      // Save new signature to profile if user opted in
      if (uploadedPreview && saveForFuture) {
        await saveUserSignature({ variables: { dataUrl: uploadedPreview } })
      }
      const canvasJson = editor.getJson()
      await onSignComplete(canvasJson)
    } catch {
      setSigning(false)
    }
  }

  const step1Done = !!preview
  const step2Done = placed
  const step3Ready = step2Done && password.length > 0

  if (meLoading) {
    return (
      <aside className="w-72 shrink-0 border-r bg-white flex items-center justify-center">
        <Spinner className="size-5" />
      </aside>
    )
  }

  return (
    <aside className="w-72 shrink-0 border-r bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <FileSignature className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Firma digital</h2>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {usingProfileSignature
            ? "Usando tu firma guardada. Completa los pasos."
            : "Completa los 3 pasos para firmar"}
        </p>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Step 1 — Firma */}
        <SignStep number={1} label="Tu firma" done={step1Done}>
          {usingProfileSignature ? (
            // Show saved profile signature
            <div className="space-y-2">
              <div className="relative rounded-lg border bg-muted/20 p-3 flex items-center justify-center h-24 overflow-hidden">
                {/* biome-ignore lint/performance/noImgElement: firma como data URL */}
                <img
                  src={savedSignatureUrl ?? ""}
                  alt="Tu firma guardada"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="size-3 text-emerald-600" />
                <span className="text-[11px] text-emerald-700 font-medium">Firma de tu perfil</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadedPreview(null)
                  fileInputRef.current?.click()
                }}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Upload className="size-3" />
                Usar una firma diferente
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
              />
            </div>
          ) : uploadedPreview ? (
            // Show uploaded preview
            <div className="space-y-1.5">
              <div className="relative rounded-lg border bg-muted/20 p-3 flex items-center justify-center h-24 overflow-hidden">
                {/* biome-ignore lint/performance/noImgElement: firma como data URL */}
                <img
                  src={uploadedPreview}
                  alt="Tu firma"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setUploadedPreview(null)
                    setPlaced(false)
                  }}
                  className="absolute top-1.5 right-1.5 size-5 rounded-full bg-background border hover:bg-destructive hover:text-white hover:border-destructive transition-colors flex items-center justify-center"
                >
                  <X className="size-3" />
                </button>
              </div>
              {/* Save for future checkbox */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={saveForFuture}
                  onChange={(e) => setSaveForFuture(e.target.checked)}
                  className="size-3.5 accent-primary"
                />
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                  Guardar como mi firma
                </span>
              </label>
            </div>
          ) : (
            // Upload dropzone
            <button
              type="button"
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors select-none",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <Upload className="size-5 mx-auto mb-1.5 text-muted-foreground" />
              <p className="text-xs font-medium">Arrastra aquí o haz click</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG o SVG</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
              />
            </button>
          )}
        </SignStep>

        {/* Step 2 — Colocar */}
        <SignStep number={2} label="Coloca en el documento" done={step2Done} disabled={!step1Done}>
          {!placed ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={!step1Done || !editor}
              onClick={handlePlace}
            >
              Colocar firma en documento
            </Button>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                <Check className="size-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-emerald-700">Firma colocada</p>
                  <p className="text-[10px] text-emerald-600">Arrástrala al lugar correcto</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePlaceAgain}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1"
              >
                <RotateCcw className="size-3" />
                Colocar de nuevo
              </button>
            </div>
          )}
        </SignStep>

        {/* Step 3 — Confirmar identidad */}
        <SignStep number={3} label="Confirma tu identidad" done={false} disabled={!step2Done}>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Contraseña</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && step3Ready && !signing) handleSign()
                }}
                disabled={!step2Done || signing}
                className="pr-9 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Confirma tu identidad para registrar la firma
            </p>
          </div>
        </SignStep>
      </div>

      {/* Footer — botón firmar */}
      <div className="p-4 border-t shrink-0">
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={!step3Ready || signing}
          onClick={handleSign}
        >
          {signing ? (
            <>
              <Spinner className="size-4 mr-2" />
              Firmando...
            </>
          ) : (
            <>
              <FileSignature className="size-4 mr-2" />
              Firmar documento
            </>
          )}
        </Button>
        {!step3Ready && (
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            {!step1Done
              ? "Sube tu imagen de firma para continuar"
              : !step2Done
                ? "Coloca la firma en el documento"
                : "Ingresa tu contraseña para firmar"}
          </p>
        )}
      </div>
    </aside>
  )
}

function SignStep({
  number,
  label,
  done,
  disabled,
  children,
}: {
  number: number
  label: string
  done: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("space-y-2.5", disabled && "opacity-40 pointer-events-none")}>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "size-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 transition-colors",
            done ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
          )}
        >
          {done ? <Check className="size-3" /> : number}
        </div>
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <div className="ml-7">{children}</div>
    </div>
  )
}
