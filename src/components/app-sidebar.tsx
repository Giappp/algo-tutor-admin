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
            className="top-0 h-svh! [&_[data-slot=sidebar-inner]]:bg-[radial-gradient(circle_at_top_left,oklch(0.43_0.16_235/0.55),transparent_30%),linear-gradient(180deg,oklch(0.27_0.115_247),var(--sidebar)_72%)]"
            {...props}
        >
            <SidebarHeader className="p-3 pb-1">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            tooltip="AlgoTutor"
                            render={<Link href="/" />}
                            className="h-16 rounded-xl border border-white/12 bg-white/8 px-3 shadow-[inset_0_1px_0_oklch(1_0_0/0.1),0_12px_30px_-20px_oklch(0.05_0.08_250/0.8)] backdrop-blur-sm hover:border-white/20 hover:bg-white/12 group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
                        >
                            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-sidebar-primary shadow-md shadow-sky-300/20">
                                <CodeIcon className="size-4.5 text-sidebar-primary-foreground" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-heading font-semibold tracking-tight text-white">AlgoTutor</span>
                                <span className="truncate text-[11px] font-medium text-sky-200/75">{t("adminWorkspace")}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="pt-3">
                <NavMain groups={groups} />
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter className="border-t border-white/10 bg-black/8 pt-2 backdrop-blur-sm">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
