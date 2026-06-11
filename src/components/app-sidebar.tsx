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
                    icon: <LayoutDashboardIcon className="size-4 text-sky-600 dark:text-sky-400" />,
                }
            ],
        },
        {
            label: t("curriculum"),
            items: [
                {
                    title: t("learningPaths"),
                    url: "/learning-paths",
                    icon: <GraduationCapIcon className="size-4 text-violet-600 dark:text-violet-400" />,
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
                    icon: <UsersIcon className="size-4 text-emerald-600 dark:text-emerald-400" />,
                },
            ],
        },
    ]

    const navSecondary = [
        {
            title: t("settings"),
            url: "/settings",
            icon: <Settings2Icon className="size-4 text-slate-500 dark:text-slate-400" />,
        },
    ]

    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]! [&_[data-slot=sidebar-inner]]:bg-[radial-gradient(circle_at_top_left,oklch(0.94_0.04_272),transparent_42%),var(--sidebar)] dark:[&_[data-slot=sidebar-inner]]:bg-[radial-gradient(circle_at_top_left,oklch(0.24_0.06_272),transparent_44%),var(--sidebar)]"
            {...props}
        >
            <SidebarHeader className="p-3 pb-1">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            tooltip="AlgoTutor"
                            render={<Link href="/" />}
                            className="h-16 rounded-xl border border-indigo-200/60 bg-white/65 px-3 shadow-sm shadow-indigo-950/5 backdrop-blur-sm hover:bg-white/90 dark:border-indigo-400/10 dark:bg-white/5 dark:hover:bg-white/10 group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
                        >
                            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20">
                                <CodeIcon className="size-4.5 text-white" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-heading font-semibold tracking-tight text-foreground">AlgoTutor</span>
                                <span className="truncate text-xs font-medium text-indigo-600/75 dark:text-indigo-300/75">{t("adminWorkspace")}</span>
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
