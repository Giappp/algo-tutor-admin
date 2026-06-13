"use client"

import { usePathname } from "next/navigation"
import { SearchForm } from "@/components/search-form"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { getBreadcrumbs } from "@/lib/breadcrumbs"
import { PanelLeftIcon } from "lucide-react"
import { LocaleSwitcher } from "@/components/locale-switcher"

export function SiteHeader({hideSidebarToggle = false}: {hideSidebarToggle?: boolean}) {
    const { toggleSidebar } = useSidebar()
    const pathname = usePathname()
    const breadcrumbs = getBreadcrumbs(pathname)

    return (
        <header className="sticky top-0 z-50 flex w-full items-center border-b border-border/70 bg-background/88 shadow-[0_1px_0_oklch(1_0_0/0.7)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
            <div className="flex h-14 w-full items-center gap-3 px-4 lg:px-6">
                {!hideSidebarToggle && (
                    <>
                        <Button
                            className="size-9 text-muted-foreground hover:text-primary"
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                        >
                            <PanelLeftIcon />
                        </Button>
                        <Separator orientation="vertical" className="h-5"/>
                    </>
                )}
                <Breadcrumb className="hidden sm:block">
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => (
                            <div key={index} className="flex items-center">
                                {index > 0 && <BreadcrumbSeparator className="mx-1" />}
                                <BreadcrumbItem>
                                    {item.href ? (
                                        <BreadcrumbLink
                                            href={item.href}
                                            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            {item.label}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage className="text-xs font-semibold text-foreground">
                                            {item.label}
                                        </BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                            </div>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="ml-auto flex items-center gap-2">
                    <LocaleSwitcher />
                    <SearchForm className="w-full sm:w-auto" />
                </div>
            </div>
        </header>
    )
}
