"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {Bot, Code2, LayoutDashboard, ListChecks, LogOut, type LucideIcon, Settings, Users} from "lucide-react"
import Link from "next/link"
import {usePathname} from "next/navigation"

interface NavItem {
    title: string
    url: string
    icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
    {title: "Tổng quan", url: "/admin", icon: LayoutDashboard},
    {title: "Quản lý Bài tập", url: "/admin/problems", icon: Code2},
    {title: "Lịch sử Nộp bài", url: "/admin/submissions", icon: ListChecks},
    {title: "Quản lý Sinh viên", url: "/admin/users", icon: Users},
    {title: "Cấu hình AI-Tutor", url: "/admin/ai-settings", icon: Bot},
    {title: "Cài đặt Hệ thống", url: "/admin/settings", icon: Settings},
]

function NavMenuItem({item, isActive}: Readonly<{ item: NavItem; isActive: boolean }>) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                <Link href={item.url}>
                    <item.icon className="size-8"/>
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

export function AppSidebar() {
    const pathname = usePathname()

    const isActive = (url: string) =>
        url === "/admin" ? pathname === url : pathname.startsWith(url)

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-2 text-xl font-bold text-primary overflow-hidden">
                    <Code2 className="size-6 shrink-0"/> {/* shrink-0 giữ icon không bị ép nhỏ */}
                    <span className="group-data-[collapsible=icon]:hidden">AlgoTutor Admin</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Chính</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {NAV_ITEMS.map((item) => (
                                <NavMenuItem
                                    key={item.url}
                                    item={item}
                                    isActive={isActive(item.url)}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="text-destructive hover:text-destructive">
                            <LogOut className="size-4"/>
                            <span>Đăng xuất</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}