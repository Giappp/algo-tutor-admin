import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import {cn} from "@/lib/utils";
import {plusJakartaSans, sora} from "@/font";
import {QueryProvider} from "@/components/shared/query-provider";
import {Toaster} from "@/components/ui/sonner";
import {NextIntlClientProvider} from "next-intl";
import {getLocale, getMessages} from "next-intl/server";

export const metadata: Metadata = {
    title: "Algo Tutor | Management Portal",
    description: "Management Portal",
};

export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html
            lang={locale} suppressHydrationWarning
            className={cn("font-sans antialiased", sora.variable, plusJakartaSans.variable)}
        >
        <body>
        <NextIntlClientProvider messages={messages}>
            <QueryProvider>
                {children}
            </QueryProvider>
            <Toaster closeButton position="top-right"/>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
