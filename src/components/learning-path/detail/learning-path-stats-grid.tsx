"use client";

import { useTranslations } from "next-intl";
import { BookOpenIcon, GlobeIcon, LayersIcon, UsersIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface LearningPathStatsGridProps {
    topicCount: number;
    totalLessonCount: number;
    publishedLessonCount: number;
    enrollmentCount: number;
}

export function LearningPathStatsGrid({
    topicCount,
    totalLessonCount,
    publishedLessonCount,
    enrollmentCount,
}: LearningPathStatsGridProps) {
    const t = useTranslations("learningPaths");

    return (
        <div className="flex items-center gap-5 rounded-2xl border border-border/40 bg-muted/20 px-5 py-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/90">
                <LayersIcon className="size-4 text-muted-foreground/60" />
                <span className="text-foreground text-sm font-extrabold">{topicCount}</span>
                <span>{t("topics", { count: topicCount }).replace(String(topicCount), "").trim()}</span>
            </div>
            <Separator orientation="vertical" className="h-5 bg-border/40 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/90">
                <BookOpenIcon className="size-4 text-muted-foreground/60" />
                <span className="text-foreground text-sm font-extrabold">{totalLessonCount}</span>
                <span>{t("lessonsCount", { count: totalLessonCount }).replace(String(totalLessonCount), "").trim()}</span>
            </div>
            <Separator orientation="vertical" className="h-5 bg-border/40 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/90">
                <GlobeIcon className="size-4 text-emerald-500/80" />
                <span className="text-foreground text-sm font-extrabold">{publishedLessonCount}</span>
                <span>{t("publishedLessons", { count: publishedLessonCount }).replace(String(publishedLessonCount), "").trim()}</span>
            </div>
            <Separator orientation="vertical" className="h-5 bg-border/40 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/90">
                <UsersIcon className="size-4 text-muted-foreground/60" />
                <span className="text-foreground text-sm font-extrabold">{enrollmentCount}</span>
                <span>{t("enrollmentsCount", { count: enrollmentCount }).replace(String(enrollmentCount), "").trim()}</span>
            </div>
        </div>
    );
}
