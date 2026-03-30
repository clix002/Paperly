"use client"

import dynamic from "next/dynamic"
import { AppBreadcrumbs } from "@/components/layout/app-breadcrumbs"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const AppSidebar = dynamic(
  () => import("@/components/layout/app-sidebar").then((m) => m.AppSidebar),
  { ssr: false }
)

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <AppBreadcrumbs />
          </div>
        </header>
        <main className="flex flex-1 flex-col min-h-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
