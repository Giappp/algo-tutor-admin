"use client";

import {Fragment} from "react";
import {usePathname} from "next/navigation";
import {PanelLeftIcon} from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {Button} from "@/components/ui/button";
import {LocaleSwitcher} from "@/components/locale-switcher";
import {useSidebar} from "@/components/ui/sidebar";
import {getBreadcrumbs} from "@/lib/breadcrumbs";
import {cn} from "@/lib/utils";

interface ContentContextBarProps {
    hideSidebarToggle?: boolean;
    flush?: boolean;
}

export function ContentContextBar({hideSidebarToggle = false, flush = false}: ContentContextBarProps) {
    const pathname = usePathname();
    const {toggleSidebar} = useSidebar();
    const breadcrumbs = getBreadcrumbs(pathname);

    return (
        <div className={cn(
            "flex min-h-12 items-center gap-2 border-b border-border/70",
            flush ? "px-4 sm:px-6" : "mb-5",
        )}>
            {!hideSidebarToggle && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                    className="text-muted-foreground hover:text-primary"
                >
                    <PanelLeftIcon/>
                </Button>
            )}

            <Breadcrumb className="min-w-0">
                <BreadcrumbList className="flex-nowrap overflow-hidden">
                    {breadcrumbs.map((item, index) => (
                        <Fragment key={`${item.label}-${index}`}>
                            {index > 0 && <BreadcrumbSeparator className="shrink-0 text-muted-foreground/45"/>}
                            <BreadcrumbItem className="min-w-0 shrink-0">
                                {item.href ? (
                                    <BreadcrumbLink
                                        href={item.href}
                                        className="truncate text-xs font-medium text-muted-foreground hover:text-primary"
                                    >
                                        {item.label}
                                    </BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage className="truncate text-xs font-semibold text-foreground">
                                        {item.label}
                                    </BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto">
                <LocaleSwitcher/>
            </div>
        </div>
    );
}
