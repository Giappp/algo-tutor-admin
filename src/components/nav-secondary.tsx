"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
    items,
    ...props
}: {
    items: {
        title: string
        url: string
        icon: React.ReactNode
    }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const pathname = usePathname()

    function isActive(url: string) {
        if (url === "/") return pathname === "/"
        return pathname === url || pathname.startsWith(url + "/")
    }

    return (
        <SidebarGroup {...props} className={`py-1 ${props.className ?? ""}`}>
            <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                size="sm"
                                data-active={isActive(item.url) ? "true" : undefined}
                                render={<Link href={item.url} />}
                                className="h-9 text-[13px] hover:bg-white/70 dark:hover:bg-white/5 data-active:bg-indigo-100/80 data-active:text-indigo-800 dark:data-active:bg-indigo-400/15 dark:data-active:text-indigo-200"
                            >
                                {item.icon}
                                <span>{item.title}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
