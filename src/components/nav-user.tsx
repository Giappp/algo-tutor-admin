"use client"

import Link from "next/link"
import {usePathname} from "next/navigation"
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar"
import {CircleUserRoundIcon, LoaderCircleIcon, LogOutIcon} from "lucide-react"
import {useAuth} from "@/hooks/use-auth-hook"
import {useAuthStore} from "@/store/authStore"
import {useTranslations} from "next-intl"

export function NavUser() {
    const {logout, isLoggingOut} = useAuth()
    const {username = "", email = ""} = useAuthStore()
    const t = useTranslations("sidebar")
    const pathname = usePathname()

    return (
        <SidebarMenu className="gap-1">
            <li className="mb-1 flex min-w-0 items-center gap-2.5 rounded-lg px-3 py-2 group-data-[collapsible=icon]:hidden">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold uppercase text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300">
                    {username.slice(0, 2) || "AT"}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-xs font-semibold text-sidebar-foreground">{username || t("account")}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{email}</p>
                </div>
            </li>
            <SidebarMenuItem>
                <SidebarMenuButton
                    tooltip={t("account")}
                    data-active={pathname === "/account" ? "true" : undefined}
                    render={<Link href="/account" />}
                    className="h-9 text-[13px] hover:bg-indigo-100/75 hover:text-indigo-700 data-active:bg-indigo-100/80 data-active:text-indigo-800 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-300 dark:data-active:bg-indigo-400/15 dark:data-active:text-indigo-200"
                >
                    <CircleUserRoundIcon className="text-indigo-600 dark:text-indigo-400"/>
                    <span>{t("account")}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                    tooltip={t("logout")}
                    disabled={isLoggingOut}
                    onClick={() => logout()}
                    className="h-9 text-[13px] text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                >
                    {isLoggingOut ? <LoaderCircleIcon className="animate-spin"/> : <LogOutIcon/>}
                    <span>{isLoggingOut ? t("loggingOut") : t("logout")}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
