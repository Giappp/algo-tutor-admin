"use client"

import * as React from "react"

import {NavMain} from "@/components/nav-main"
import {NavSecondary} from "@/components/nav-secondary"
import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    BotIcon,
    CodeIcon,
    GraduationCapIcon,
    LayoutDashboardIcon,
    LineChartIcon,
    Settings2Icon,
    TerminalSquareIcon,
    UsersIcon,
} from "lucide-react"
import Link from "next/link"

const groups = [
    {
        label: "Overview",
        items: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: <LayoutDashboardIcon className="w-4 h-4"/>,
                isActive: true,
                items: [],
            },
            {
                title: "Analytics",
                url: "/dashboard/analytics",
                icon: <LineChartIcon className="w-4 h-4"/>,
                items: [],
            },
        ],
    },
    {
        label: "Curriculum",
        items: [
            {
                title: "Learning Paths",
                url: "/dashboard/learning-paths",
                icon: <GraduationCapIcon className="w-4 h-4"/>,
                items: [
                    {title: "All Paths", url: "/dashboard/learning-paths"},
                    {title: "Create New", url: "/dashboard/learning-paths/create"},
                ],
            },
        ],
    },
    {
        label: "AI Lab",
        items: [
            {
                title: "AI Models",
                url: "/dashboard/models",
                icon: <BotIcon className="w-4 h-4"/>,
                items: [],
            },
            {
                title: "Playground",
                url: "/dashboard/playground",
                icon: <TerminalSquareIcon className="w-4 h-4"/>,
                items: [],
            },
        ],
    },
    {
        label: "Administration",
        items: [
            {
                title: "Users",
                url: "/dashboard/users",
                icon: <UsersIcon className="w-4 h-4"/>,
                items: [],
            },
        ],
    },
]

const navSecondary = [
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: <Settings2Icon className="w-4 h-4"/>,
    },
]

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link href="/"/>}>
                            <div
                                className="flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20">
                                <CodeIcon className="size-4 text-white"/>
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold text-foreground">AlgoTutor</span>
                                <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain groups={groups}/>
                <NavSecondary items={navSecondary} className="mt-auto"/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser/>
            </SidebarFooter>
        </Sidebar>
    )
}
