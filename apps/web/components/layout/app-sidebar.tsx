"use client"

import { Role } from "@paperly/shared"
import {
  ChevronsUpDown,
  FileText,
  GitPullRequestArrow,
  LayoutDashboard,
  LogOut,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { signOut, useSession } from "@/lib/auth-client"
import { NotificationBell } from "./notification-bell"

const HR_NAV = [
  { label: "Dashboard", href: "/hr", icon: LayoutDashboard },
  { label: "Documentos", href: "/hr/documents", icon: FileText },
  { label: "Seguimiento", href: "/hr/tracking", icon: GitPullRequestArrow },
  { label: "Consultas", href: "/hr/queries", icon: MessageSquare },
] as const

const WORKER_NAV = [{ label: "Mis documentos", href: "/dashboard", icon: FileText }] as const

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function NavUser() {
  const { data: session } = useSession()

  const router = useRouter()

  const user = session?.user
  const role = (user as { role?: string })?.role

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                {user?.name ? getInitials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {role === Role.HR ? "Recursos Humanos" : "Trabajador"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="top"
            align="start"
            sideOffset={4}
          >
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                  {user?.name ? getInitials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = useSession()
  const pathname = usePathname()

  const role = (session?.user as { role?: string })?.role
  const navItems = role === Role.HR ? HR_NAV : WORKER_NAV

  return (
    <Sidebar collapsible="icon" {...props}>
      {!isPending && (
        <>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  render={<Link href={role === Role.HR ? "/hr" : "/dashboard"} />}
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    P
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Paperly</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Gestión documental
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="px-2 pb-1">
              <NotificationBell />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{role === Role.HR ? "RR.HH." : "Principal"}</SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/hr" || item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <NavUser />
          </SidebarFooter>
        </>
      )}
      <SidebarRail />
    </Sidebar>
  )
}
