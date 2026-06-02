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
    BotIcon,
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
                    icon: <LayoutDashboardIcon className="size-4" />,
                }
            ],
        },
        {
            label: t("curriculum"),
            items: [
                {
                    title: t("learningPaths"),
                    url: "/learning-paths",
                    icon: <GraduationCapIcon className="size-4" />,
                    items: [
                        { title: t("allPaths"), url: "/learning-paths" },
                        { title: t("createNew"), url: "/learning-paths/create" },
                    ],
                },
            ],
        },
        {
            label: t("aiLab"),
            items: [
                {
                    title: t("aiModels"),
                    url: "/models",
                    icon: <BotIcon className="size-4" />,
                }
            ],
        },
        {
            label: t("administration"),
            items: [
                {
                    title: t("users"),
                    url: "/users",
                    icon: <UsersIcon className="size-4" />,
                },
            ],
        },
    ]

    const navSecondary = [
        {
            title: t("settings"),
            url: "/settings",
            icon: <Settings2Icon className="size-4" />,
        },
    ]

    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
            {...props}
        >
            <SidebarHeader className="pb-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link href="/" />}>
                            <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-sm">
                                <CodeIcon className="size-3.5 text-white" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold text-foreground">AlgoTutor</span>
                                <span className="truncate text-sm text-muted-foreground">{t("dashboard")}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="pt-2">
                <NavMain groups={groups} />
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter className="pt-0">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
