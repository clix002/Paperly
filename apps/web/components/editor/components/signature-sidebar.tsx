"use client"

import { Key, Loader, Upload } from "lucide-react"
import NextImage from "next/image"
import { useId, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import type { ActiveTool, Editor } from "../types"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ToolSidebarHeader } from "./tool-sidebar-header"

interface SignatureSidebarProps {
  editor: Editor | undefined
  activeTool: ActiveTool
  onChangeActiveTool: (tool: ActiveTool) => void
}

export const SignatureSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: SignatureSidebarProps) => {
  const tokenId = useId()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [token, setToken] = useState("")
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: session, isPending } = useSession()
  const user = session?.user

  const onClose = () => {
    onChangeActiveTool("select")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Archivo inválido")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setSignaturePreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleSignatureClick = () => {
    if (!signaturePreview) {
      toast.error("Sube tu firma")
      return
    }
    setToken("")
    setIsDialogOpen(true)
  }

  const handleConfirmToken = async () => {
    if (!token || !signaturePreview) return

    setIsAdding(true)
    try {
      editor?.addImage(signaturePreview)
      toast.success("Firma agregada")
      setIsDialogOpen(false)
      onChangeActiveTool("select")
    } catch (_error) {
      toast.error("Error de firma")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      <aside
        className={cn(
          "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
          activeTool === "signatures" ? "visible" : "hidden"
        )}
      >
        <ToolSidebarHeader title="Firmas" description="Agrega tu firma digital al documento" />

        {isPending && (
          <div className="flex items-center justify-center flex-1">
            <Loader className="size-4 text-muted-foreground animate-spin" />
          </div>
        )}

        {!user && !isPending && (
          <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
            <p className="text-muted-foreground text-xs text-center px-4">
              Inicia sesion para usar tu firma
            </p>
          </div>
        )}

        {user && (
          <ScrollArea>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Subir imagen de firma</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Seleccionar imagen
                </Button>
              </div>

              {signaturePreview && (
                <div className="space-y-2">
                  <Label>Tu Firma</Label>
                  <button
                    onClick={handleSignatureClick}
                    className="relative w-full h-[120px] group hover:opacity-75 transition bg-white rounded-sm overflow-hidden border flex items-center justify-center p-2"
                    type="button"
                  >
                    <NextImage
                      src={signaturePreview}
                      alt="Tu firma"
                      width={200}
                      height={100}
                      className="object-contain max-h-full max-w-full"
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity">
                      <span className="bg-white text-black text-xs px-2 py-1 rounded shadow">
                        Click para agregar
                      </span>
                    </div>
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Haz click en la imagen e ingresa tu token para agregar la firma al documento.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <ToolSidebarClose onClick={onClose} />
      </aside>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificar Identidad</DialogTitle>
            <DialogDescription>
              Ingresa tu token de firma para confirmar que eres tu quien esta firmando este
              documento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor={tokenId}>Token de Firma</Label>
              <div className="relative">
                <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id={tokenId}
                  type="password"
                  placeholder="Ingresa tu token"
                  className="pl-9"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isAdding}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmToken} disabled={!token || isAdding}>
              {isAdding ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                "Confirmar y Agregar Firma"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
