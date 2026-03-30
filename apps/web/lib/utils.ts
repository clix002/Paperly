import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)

  if (mins < 1) return "Ahora"
  if (mins < 60) return `Hace ${mins}m`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 7) return `Hace ${days}d`
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

export function getInitials(name?: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function filterBySearchAndStatus<T extends { title: string; status: string }>(
  items: T[],
  search: string,
  allowedStatuses?: string[]
): T[] {
  const q = search.toLowerCase()

  return items.filter((item) => {
    const matchesSearch = !q || item.title.toLowerCase().includes(q)
    const matchesStatus = !allowedStatuses || allowedStatuses.includes(item.status)
    return matchesSearch && matchesStatus
  })
}
