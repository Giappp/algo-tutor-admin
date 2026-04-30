"use client";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
    return (
        <div className="relative min-h-svh flex items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 via-indigo-50/30 to-zinc-50 dark:from-zinc-950 dark:via-indigo-950/20 dark:to-zinc-950">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large gradient blob top right */}
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl" />
                {/* Large gradient blob bottom left */}
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/10 via-indigo-500/5 to-transparent blur-3xl" />
                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Login form container */}
            <div className="relative w-full max-w-md px-6 py-12">
                <LoginForm />
            </div>
        </div>
    );
}
