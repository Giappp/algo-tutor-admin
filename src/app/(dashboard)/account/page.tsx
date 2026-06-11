"use client"

import {CircleUserRoundIcon, MailIcon, ShieldCheckIcon} from "lucide-react"
import {useAuthStore} from "@/store/authStore"

export default function AccountPage() {
    const {username, email} = useAuthStore()

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                    AlgoTutor Admin
                </p>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">Tài khoản</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Thông tin tài khoản đang đăng nhập vào hệ thống quản trị.
                </p>
            </div>

            <section className="overflow-hidden rounded-2xl border border-indigo-200/70 bg-card shadow-sm shadow-indigo-950/5 dark:border-indigo-400/15">
                <div className="flex items-center gap-4 bg-indigo-50/80 px-6 py-5 dark:bg-indigo-400/10">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold uppercase text-white shadow-md shadow-indigo-600/20">
                        {username.slice(0, 2) || "AT"}
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate font-heading text-lg font-semibold">{username || "AlgoTutor Admin"}</h2>
                        <p className="truncate text-sm text-muted-foreground">{email || "Chưa có email"}</p>
                    </div>
                </div>

                <dl className="grid gap-px bg-border sm:grid-cols-2">
                    <div className="flex items-center gap-3 bg-card px-6 py-5">
                        <CircleUserRoundIcon className="size-5 text-indigo-600 dark:text-indigo-400"/>
                        <div>
                            <dt className="text-xs text-muted-foreground">Tên đăng nhập</dt>
                            <dd className="mt-0.5 text-sm font-medium">{username || "Chưa cập nhật"}</dd>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-card px-6 py-5">
                        <MailIcon className="size-5 text-indigo-600 dark:text-indigo-400"/>
                        <div className="min-w-0">
                            <dt className="text-xs text-muted-foreground">Email</dt>
                            <dd className="mt-0.5 truncate text-sm font-medium">{email || "Chưa cập nhật"}</dd>
                        </div>
                    </div>
                </dl>

                <div className="flex items-center gap-2 border-t px-6 py-4 text-xs text-muted-foreground">
                    <ShieldCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400"/>
                    Phiên đăng nhập được bảo vệ bởi hệ thống xác thực AlgoTutor.
                </div>
            </section>
        </div>
    )
}
