"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"

interface WorkerAvatarProps {
  name?: string | null
  isHR?: boolean
  size?: "xs" | "sm" | "lg"
}

const SIZE_CLASSES = {
  xs: { avatar: "size-5", text: "text-[9px]" },
  sm: { avatar: "size-8", text: "text-xs" },
  lg: { avatar: "size-10", text: "text-sm" },
}

export function WorkerAvatar({ name, isHR = false, size = "sm" }: WorkerAvatarProps) {
  const s = SIZE_CLASSES[size]

  return (
    <Avatar className={s.avatar}>
      <AvatarFallback
        className={cn(
          "font-semibold",
          s.text,
          isHR ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
