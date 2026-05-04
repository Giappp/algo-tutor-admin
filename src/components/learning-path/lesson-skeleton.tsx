"use client";

import {Skeleton} from "@/components/ui/skeleton";
import {Card} from "@/components/ui/card";

export function LessonPageSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            {/* Header skeleton */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-transparent p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <Skeleton className="size-10 rounded-xl"/>
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64"/>
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-20 rounded-full"/>
                                <Skeleton className="h-5 w-16 rounded-full"/>
                                <Skeleton className="h-5 w-20 rounded-full"/>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-28"/>
                        <Skeleton className="h-9 w-20"/>
                    </div>
                </div>
            </div>

            {/* Tabs skeleton */}
            <div className="space-y-4">
                <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-10 w-28 rounded-lg"/>
                    ))}
                </div>

                {/* Content skeleton */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-6 w-6 rounded"/>
                            <Skeleton className="h-6 w-40"/>
                        </div>
                        <Skeleton className="h-40 w-full rounded-lg"/>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export function LessonListSkeleton({count = 5}: {count?: number}) {
    return (
        <div className="space-y-3">
            {Array.from({length: count}).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-muted animate-pulse"/>
            ))}
        </div>
    );
}
