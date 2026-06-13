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
                <SidebarGroup key={group.label} className="py-1.5">
                    <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">
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
                                        className="h-9 rounded-lg text-[13px] font-medium text-sidebar-foreground/72 hover:bg-white/75 hover:text-sidebar-accent-foreground dark:hover:bg-white/5 data-active:bg-sidebar-accent data-active:font-semibold data-active:text-sidebar-accent-foreground data-active:shadow-sm data-active:shadow-blue-950/5"
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
                                                                    className="text-sm h-7"
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
