"use client"

import { Upload } from "lucide-react"
import NextImage from "next/image"
import { useRef, useState } from "react"
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close"
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { ActiveTool, Editor } from "../types"

interface UploadedImage {
  id: string
  url: string
  fileName: string
}

interface ImageSidebarProps {
  editor: Editor | undefined
  activeTool: ActiveTool
  onChangeActiveTool: (tool: ActiveTool) => void
}

export const ImageSidebar = ({ editor, activeTool, onChangeActiveTool }: ImageSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<UploadedImage[]>([])

  const onClose = () => {
    onChangeActiveTool("select")
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!res.ok) continue

      const { url } = await res.json()

      setImages((prev) => [...prev, { id: `${Date.now()}-${file.name}`, url, fileName: file.name }])
      editor?.addImage(url)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <aside
      className={cn(
        "bg-background relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "images" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Images" description="Add images to your canvas" />
      <div className="p-4 border-b">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button className="w-full" onClick={() => fileInputRef.current?.click()}>
          <Upload className="size-4 mr-2" />
          Upload Image
        </Button>
        <p className="text-xs text-muted-foreground mt-2">Supported formats: PNG, JPG, SVG, WebP</p>
      </div>

      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {images.map((image) => (
              <button
                onClick={() => editor?.addImage(image.url)}
                key={image.id}
                className="relative w-full h-[100px] group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                type="button"
              >
                <NextImage src={image.url} alt={image.fileName} fill className="object-cover" />
                <div className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white p-1 bg-black/50 text-left">
                  {image.fileName}
                </div>
              </button>
            ))}
          </div>

          {images.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No images yet</p>
              <p className="text-muted-foreground text-xs mt-1">Upload your first image</p>
            </div>
          )}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  )
}
