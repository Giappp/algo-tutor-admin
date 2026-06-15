"use client";

import type {ReactNode} from "react";
import {usePathname} from "next/navigation";
import {AppSidebar} from "@/components/app-sidebar";
import {ContentContextBar} from "@/components/content-context-bar";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {cn} from "@/lib/utils";

const LEARNING_PATH_WORKSPACE_PATTERN = /^\/learning-paths\/\d+$/;

export function DashboardShell({children}: {children: ReactNode}) {
    const pathname = usePathname();
    const isLearningPathWorkspace = LEARNING_PATH_WORKSPACE_PATTERN.test(pathname);

    return (
        <div>
            <SidebarProvider defaultOpen={!isLearningPathWorkspace}>
                <div className="flex min-h-svh flex-1">
                    {!isLearningPathWorkspace && <AppSidebar/>}
                    <SidebarInset className={cn(
                        "border-l border-border/70",
                        isLearningPathWorkspace ? "bg-background" : "bg-main-surface"
                    )}>
                        {isLearningPathWorkspace ? (
                            <>
                                <ContentContextBar hideSidebarToggle flush/>
                                <div>{children}</div>
                            </>
                        ) : (
                            <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
                                <ContentContextBar/>
                                {children}
                            </div>
                        )}
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}
