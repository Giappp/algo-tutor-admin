"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
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
    CodeIcon,
    GraduationCapIcon,
    LayoutDashboardIcon,
    Settings2Icon,
    UsersIcon,
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const t = useTranslations("sidebar")

    const groups = [
        {
            label: t("overview"),
            items: [
                {
                    title: t("dashboard"),
                    url: "/",
                    icon: <LayoutDashboardIcon />,
                }
            ],
        },
        {
            label: t("curriculum"),
            items: [
                {
                    title: t("learningPaths"),
                    url: "/learning-paths",
                    icon: <GraduationCapIcon />,
                    items: [
                        { title: t("allPaths"), url: "/learning-paths" },
                        { title: t("createNew"), url: "/learning-paths/create" },
                    ],
                },
            ],
        },
        {
            label: t("administration"),
            items: [
                {
                    title: t("users"),
                    url: "/users",
                    icon: <UsersIcon />,
                },
            ],
        },
    ]

    const navSecondary = [
        {
            title: t("settings"),
            url: "/settings",
            icon: <Settings2Icon />,
        },
    ]

    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]! [&_[data-slot=sidebar-inner]]:bg-[linear-gradient(180deg,oklch(0.985_0.012_248),var(--sidebar)_28%)] dark:[&_[data-slot=sidebar-inner]]:bg-[linear-gradient(180deg,oklch(0.21_0.04_252),var(--sidebar)_28%)]"
            {...props}
        >
            <SidebarHeader className="p-3 pb-1">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            tooltip="AlgoTutor"
                            render={<Link href="/" />}
                            className="h-16 rounded-xl border border-sidebar-border/75 bg-white/70 px-3 shadow-sm shadow-blue-950/5 backdrop-blur-sm hover:border-primary/20 hover:bg-white dark:bg-white/5 dark:hover:bg-white/8 group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
                        >
                            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/25">
                                <CodeIcon className="size-4.5 text-white" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-heading font-semibold tracking-tight text-foreground">AlgoTutor</span>
                                <span className="truncate text-[11px] font-medium text-primary/80">{t("adminWorkspace")}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="pt-3">
                <NavMain groups={groups} />
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border/70 bg-sidebar/50 pt-2 backdrop-blur-sm">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
