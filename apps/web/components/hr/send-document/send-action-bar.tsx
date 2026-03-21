"use client"

import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface SendActionBarProps {
  selectedCount: number
  isSending: boolean
  onSend: () => void
  onCancel: () => void
}

export function SendActionBar({ selectedCount, isSending, onSend, onCancel }: SendActionBarProps) {
  return (
    <div className="border-t px-5 py-4 space-y-3">
      {selectedCount > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Se{" "}
          {selectedCount === 1
            ? "creará 1 copia independiente"
            : `crearán ${selectedCount} copias independientes`}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSending} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={onSend} disabled={selectedCount === 0 || isSending} className="flex-1">
          {isSending ? <Spinner className="size-4 mr-2" /> : <Send className="size-4 mr-2" />}
          {selectedCount === 0
            ? "Enviar"
            : `Enviar a ${selectedCount} trabajador${selectedCount > 1 ? "es" : ""}`}
        </Button>
      </div>
    </div>
  )
}
