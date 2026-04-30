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

export function SiteHeader() {
    const { toggleSidebar } = useSidebar()
    const pathname = usePathname()
    const breadcrumbs = getBreadcrumbs(pathname)

    return (
        <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 w-full items-center gap-4 px-4">
                <Button
                    className="size-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                >
                    <PanelLeftIcon className="size-[18px]" />
                </Button>
                <Separator
                    orientation="vertical"
                    className="h-5"
                />
                <Breadcrumb className="hidden sm:block">
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => (
                            <div key={index} className="flex items-center">
                                {index > 0 && <BreadcrumbSeparator className="mx-1" />}
                                <BreadcrumbItem>
                                    {item.href ? (
                                        <BreadcrumbLink
                                            href={item.href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {item.label}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage className="text-sm font-medium text-foreground">
                                            {item.label}
                                        </BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                            </div>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="ml-auto">
                    <SearchForm className="w-full sm:w-auto" />
                </div>
            </div>
        </header>
    )
}
