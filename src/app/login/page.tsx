"use client";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[linear-gradient(145deg,oklch(0.99_0.004_240),oklch(0.955_0.035_232),oklch(0.985_0.008_248))] dark:bg-[linear-gradient(145deg,oklch(0.15_0.025_248),oklch(0.19_0.055_240),oklch(0.16_0.03_252))]">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large gradient blob top right */}
                <div className="absolute -right-40 -top-40 size-96 rounded-full bg-gradient-to-br from-sky-500/15 via-blue-500/8 to-transparent blur-3xl" />
                {/* Large gradient blob bottom left */}
                <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-gradient-to-tr from-blue-600/12 via-cyan-500/6 to-transparent blur-3xl" />
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
