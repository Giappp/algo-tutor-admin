"use client"
import React from "react";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/dashboard/SideBar";

const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-muted/40">
                <AppSidebar/>

                <main className="flex-1 flex flex-col min-w-0">
                    <header className="flex items-center h-14 lg:h-15 gap-4 border-b bg-muted/40 px-6">
                        <SidebarTrigger/>
                        <h1 className="font-semibold text-lg">Admin Dashboard</h1>
                    </header>

                    <div className="flex-1 p-6">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}
export default Layout
