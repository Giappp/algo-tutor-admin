import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import {cn} from "@/lib/utils";
import {averageSans, splineSansMono} from "@/font";
import {QueryProvider} from "@/components/shared/query-provider";

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
            className={cn("font-sans", averageSans.variable, splineSansMono.variable)}
        >
        <body>
        <QueryProvider>
            {children}
        </QueryProvider>
        </body>
        </html>
    );
}
