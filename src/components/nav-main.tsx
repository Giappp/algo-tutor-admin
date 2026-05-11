"use client"

import {usePathname} from "next/navigation"
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
import {ChevronRightIcon} from "lucide-react"

type NavItem = {
    title: string
    url: string
    icon: React.ReactNode
    isActive?: boolean
    items?: {
        title: string
        url: string
    }[]
}

type NavGroup = {
    label: string
    items: NavItem[]
}

export function NavMain({
    groups,
    defaultLabel = "Platform",
}: {
    groups?: NavGroup[]
    defaultLabel?: string
}) {
    const pathname = usePathname()

    const resolvedGroups: NavGroup[] = groups ?? [
        {
            label: defaultLabel,
            items: [],
        },
    ]

    function isItemActive(url: string) {
        return pathname === url || pathname.startsWith(url + "/")
    }

    return (
        <>
            {resolvedGroups.map((group) => (
                <SidebarGroup key={group.label}>
                    <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                        {group.label}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => {
                            const active = isItemActive(item.url)
                            return (
                                <Collapsible
                                    key={item.title}
                                    defaultOpen={active}
                                    render={<SidebarMenuItem/>}
                                >
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        data-active={active ? "true" : undefined}
                                        render={<Link href={item.url}/>}
                                    >
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                    {item.items?.length ? (
                                        <>
                                            <SidebarMenuAction
                                                render={<CollapsibleTrigger/>}
                                                className="aria-expanded:rotate-90"
                                            >
                                                <ChevronRightIcon/>
                                                <span className="sr-only">Toggle</span>
                                            </SidebarMenuAction>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => {
                                                        const subActive = isItemActive(subItem.url)
                                                        return (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton
                                                                    data-active={subActive ? "true" : undefined}
                                                                    render={<Link href={subItem.url}/>}
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
