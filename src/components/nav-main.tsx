"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

type NavItem = {
    title: string
    url: string
    icon: React.ReactNode
    items?: {
        title: string
        url: string
    }[]
}

type NavGroup = {
    label: string
    items: NavItem[]
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
    const pathname = usePathname()

    function isItemActive(item: NavItem) {
        // Exact match for the item itself
        if (pathname === item.url) return true
        // If item has sub-items, check if any sub-item is active
        if (item.items?.length) {
            return item.items.some(
                (sub) => pathname === sub.url || pathname.startsWith(sub.url + "/")
            )
        }

        if (item.url === "/") {
            return pathname === "/"
        }
        return pathname.startsWith(item.url + "/")
    }

    function isSubItemActive(url: string) {
        return pathname === url || pathname.startsWith(url + "/")
    }

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.label} className="py-1">
                    <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-0.5">
                        {group.label}
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-0.5">
                        {group.items.map((item) => {
                            const active = isItemActive(item)
                            const hasSubItems = !!item.items?.length

                            return (
                                <Collapsible
                                    key={item.title}
                                    defaultOpen={active}
                                    render={<SidebarMenuItem />}
                                >
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        data-active={active ? "true" : undefined}
                                        render={<Link href={item.url} />}
                                        className="h-8 text-[13px]"
                                    >
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                    {hasSubItems ? (
                                        <>
                                            <SidebarMenuAction
                                                render={<CollapsibleTrigger />}
                                                className="aria-expanded:rotate-90"
                                            >
                                                <ChevronRightIcon />
                                                <span className="sr-only">Toggle</span>
                                            </SidebarMenuAction>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items!.map((subItem) => {
                                                        const subActive = isSubItemActive(subItem.url)
                                                        return (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton
                                                                    data-active={subActive ? "true" : undefined}
                                                                    render={<Link href={subItem.url} />}
                                                                    className="text-[12px] h-7"
                                                                >
                                                                    <span>{subItem.title}</span>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        )
                                                    })}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </>
                                    ) : null}
                                </Collapsible>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    )
}
