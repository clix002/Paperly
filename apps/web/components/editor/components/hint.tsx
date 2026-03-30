"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface HintProps {
  label: string
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  sideOffset?: number
  alignOffset?: number
}

export const Hint = ({ label, children, side, align, sideOffset, alignOffset }: HintProps) => {
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
        <p className="font-semibold capitalize">{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
