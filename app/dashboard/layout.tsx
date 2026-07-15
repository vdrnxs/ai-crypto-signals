"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { SYMBOL_SLUGS } from "@/lib/constants"
import { SYMBOL_METADATA } from "@/lib/api/constants"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)

    const breadcrumbs = [{ label: "Signals", href: "/dashboard" }]

    if (segments[1] === "signals" && segments[2]) {
      const symbol = SYMBOL_SLUGS[segments[2]]
      if (symbol) {
        breadcrumbs.push({
          label: SYMBOL_METADATA[symbol].label,
          href: `/dashboard/signals/${segments[2]}`,
        })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-border" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="contents">
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mx-auto w-full max-w-7xl py-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}