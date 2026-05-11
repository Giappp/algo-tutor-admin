import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import {cn} from "@/lib/utils";
import {plusJakartaSans, sora} from "@/font";
import {QueryProvider} from "@/components/shared/query-provider";
import {Toaster} from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: "Algo Tutor | Management Portal",
    description: "Management Portal",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en" suppressHydrationWarning
            className={cn("font-sans antialiased", sora.variable, plusJakartaSans.variable)}
        >
        <body>
        <QueryProvider>
            {children}
        </QueryProvider>
        <Toaster closeButton position="top-right"/>
        </body>
        </html>
    );
}
