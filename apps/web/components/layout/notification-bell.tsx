"use client"

import { useMutation, useQuery } from "@apollo/client/react"
import { Bell } from "lucide-react"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  GetMyNotificationsDocument,
  GetUnreadCountDocument,
  MarkAllNotificationsReadDocument,
  MarkNotificationReadDocument,
  NotificationType,
} from "@/lib/apollo/generated/graphql"
import { useSession } from "@/lib/auth-client"

const HR_NOTIFICATION_HREF: Partial<Record<NotificationType, (documentId: string) => string>> = {
  [NotificationType.DocumentSigned]: (id) => `/hr/tracking?doc=${id}`,
  [NotificationType.DocumentInReview]: () => `/hr/queries`,
  [NotificationType.CommentReceived]: () => `/hr/queries`,
}

const WORKER_NOTIFICATION_HREF: Partial<Record<NotificationType, (documentId: string) => string>> =
  {
    [NotificationType.DocumentSent]: (id) => `/dashboard/documents/${id}`,
    [NotificationType.CommentReceived]: (id) => `/dashboard/documents/${id}`,
  }

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "ahora"
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export function NotificationBell() {
  const { data: session } = useSession()
  const role = (session?.user as { role?: string } | undefined)?.role
  const NOTIFICATION_HREF = role === "hr" ? HR_NOTIFICATION_HREF : WORKER_NOTIFICATION_HREF

  const { data: countData } = useQuery(GetUnreadCountDocument, {
    pollInterval: 30000,
  })

  const { data } = useQuery(GetMyNotificationsDocument, {
    fetchPolicy: "cache-and-network",
  })

  const [markRead] = useMutation(MarkNotificationReadDocument, {
    refetchQueries: [GetUnreadCountDocument, GetMyNotificationsDocument],
  })

  const [markAllRead] = useMutation(MarkAllNotificationsReadDocument, {
    refetchQueries: [GetUnreadCountDocument, GetMyNotificationsDocument],
  })

  const unreadCount = countData?.getUnreadCount ?? 0
  const notifications = data?.getMyNotifications ?? []

  const handleClick = (id: string, isRead: boolean) => {
    if (!isRead) markRead({ variables: { id } })
  }

  return (
    <Popover>
      <PopoverTrigger
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="right" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Notificaciones</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Marcar todas
            </button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-10">Sin notificaciones</p>
          ) : (
            <ul>
              {notifications.map((n) => {
                const hrefFn = NOTIFICATION_HREF[n.type]
                const href = n.documentId && hrefFn ? hrefFn(n.documentId) : null
                const rowClass = `flex gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.isRead ? "bg-primary/5" : ""}`
                const dotClass = `mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${!n.isRead ? "bg-primary" : ""}`

                return href ? (
                  <li key={n.id}>
                    <Link
                      href={href}
                      className={rowClass}
                      onClick={() => handleClick(n.id, n.isRead)}
                    >
                      <span className={dotClass} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{n.title}</p>
                        {n.message && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ) : (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={`w-full text-left ${rowClass}`}
                      onClick={() => handleClick(n.id, n.isRead)}
                    >
                      <span className={dotClass} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{n.title}</p>
                        {n.message && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
