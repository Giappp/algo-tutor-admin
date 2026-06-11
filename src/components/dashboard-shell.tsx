"use client";

import type {ReactNode} from "react";
import {usePathname} from "next/navigation";
import {AppSidebar} from "@/components/app-sidebar";
import {SiteHeader} from "@/components/site-header";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {cn} from "@/lib/utils";

const LEARNING_PATH_WORKSPACE_PATTERN = /^\/learning-paths\/\d+$/;

export function DashboardShell({children}: {children: ReactNode}) {
    const pathname = usePathname();
    const isLearningPathWorkspace = LEARNING_PATH_WORKSPACE_PATTERN.test(pathname);

    return (
        <div className="[--header-height:calc(--spacing(14))]">
            <SidebarProvider className="flex flex-col" defaultOpen={!isLearningPathWorkspace}>
                <SiteHeader hideSidebarToggle={isLearningPathWorkspace}/>
                <div className="flex flex-1">
                    {!isLearningPathWorkspace && <AppSidebar/>}
                    <SidebarInset>
                        <div className={cn(isLearningPathWorkspace ? "p-0" : "p-6")}>
                            {children}
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}
