"use client"

import * as React from "react"
import {usePathname} from "next/navigation"
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
        if (url === "/dashboard") return pathname === "/dashboard"
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
                                render={<Link href={item.url}/>}
                                className="h-8 text-[13px]"
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
