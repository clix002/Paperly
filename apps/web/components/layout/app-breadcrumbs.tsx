"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const SEGMENT_LABELS: Record<string, string> = {
  hr: "RR.HH.",
  documents: "Documentos",
  new: "Nuevo",
  edit: "Editar",
  tracking: "Seguimiento",
  dashboard: "Inicio",
}

function generateBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: { label: string; href?: string }[] = []

  let currentPath = ""
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`
    const isLast = i === segments.length - 1
    const label = SEGMENT_LABELS[segment] ?? (segment.length > 10 ? "Documento" : segment)

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    })
  }

  return breadcrumbs
}

export function AppBreadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  if (breadcrumbs.length <= 1) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((bc, idx) => {
          const isLast = bc.href === undefined
          return (
            <span key={bc.href ?? bc.label} className="flex items-center">
              {idx > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast || !bc.href ? (
                  <BreadcrumbPage>{bc.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={bc.href} />}>{bc.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
