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
  LineChartIcon,
  Settings2Icon,
  TerminalSquareIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Problems",
      url: "/dashboard/problems",
      icon: <CodeIcon />,
      isActive: true,
      items: [
        { title: "All Problems", url: "/dashboard/problems" },
        { title: "Create Problem", url: "/dashboard/problems/create" },
        { title: "Tags Management", url: "/dashboard/tags" },
      ],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: <LineChartIcon />,
      items: [],
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: <UsersIcon />,
      items: [],
    },
    {
      title: "AI Models",
      url: "/dashboard/models",
      icon: <BotIcon />,
      items: [],
    },
    {
      title: "Playground",
      url: "/dashboard/playground",
      icon: <TerminalSquareIcon />,
      items: [],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings2Icon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <CodeIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">AlgoTutor</span>
                <span className="truncate text-xs">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
