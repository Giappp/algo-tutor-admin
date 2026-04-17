"use client"

import {usePathname} from "next/navigation"
import {SearchForm} from "@/components/search-form"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Button} from "@/components/ui/button"
import {Separator} from "@/components/ui/separator"
import {useSidebar} from "@/components/ui/sidebar"
import {getBreadcrumbs} from "@/lib/breadcrumbs"
import {PanelLeftIcon} from "lucide-react"

export function SiteHeader() {
    const {toggleSidebar} = useSidebar()
    const pathname = usePathname()
    const breadcrumbs = getBreadcrumbs(pathname)

    return (
        <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
            <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
                <Button
                    className="size-8"
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                >
                    <PanelLeftIcon/>
                </Button>
                <Separator
                    orientation="vertical"
                    className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                />
                <Breadcrumb className="hidden sm:block">
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => (
                            <div key={index} className="flex clear-both items-center gap-2">
                                {index > 0 && <BreadcrumbSeparator/>}
                                <BreadcrumbItem>
                                    {item.href ? (
                                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                            </div>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
                <SearchForm className="w-full sm:ml-auto sm:w-auto"/>
            </div>
        </header>
    )
}
