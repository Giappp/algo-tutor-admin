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
            <li className="mb-1 flex min-w-0 items-center gap-2.5 rounded-xl border border-white/8 bg-white/6 px-3 py-2.5 group-data-[collapsible=icon]:hidden">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-bold uppercase text-sidebar-primary-foreground shadow-sm shadow-sky-300/15">
                    {username.slice(0, 2) || "AT"}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-xs font-semibold text-white">{username || t("account")}</p>
                    <p className="truncate text-[10px] text-white/60">{email}</p>
                </div>
            </li>
            <SidebarMenuItem>
                <SidebarMenuButton
                    tooltip={t("account")}
                    data-active={pathname === "/account" ? "true" : undefined}
                    render={<Link href="/account" />}
                    className="h-9 text-[13px] font-medium text-white/88 hover:bg-white/10 hover:text-white data-active:bg-white/15 data-active:font-semibold data-active:text-white [&_svg]:text-white/72 data-active:[&_svg]:text-sidebar-primary"
                >
                    <CircleUserRoundIcon/>
                    <span>{t("account")}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                    tooltip={t("logout")}
                    disabled={isLoggingOut}
                    onClick={() => logout()}
                    className="h-9 text-[13px] text-white/72 hover:bg-red-400/15 hover:text-white"
                >
                    {isLoggingOut ? <LoaderCircleIcon className="animate-spin"/> : <LogOutIcon/>}
                    <span>{isLoggingOut ? t("loggingOut") : t("logout")}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
