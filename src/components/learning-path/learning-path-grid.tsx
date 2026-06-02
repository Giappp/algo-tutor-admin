"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    BookOpenIcon,
    GlobeIcon,
    GraduationCapIcon,
    LayersIcon,
    Pencil,
    Rocket,
    Trash2,
    UsersIcon,
    EyeIcon
} from "lucide-react";
import { LearningPath, Level } from "@/types/learning-path";
import { Skeleton } from "@/components/ui/skeleton";

const LEVEL_COLORS: Record<Level, { bg: string; text: string }> = {
    BEGINNER: {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-700 dark:text-emerald-400",
    },
    INTERMEDIATE: {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-700 dark:text-amber-400",
    },
    ADVANCED: {
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-700 dark:text-rose-400",
    },
};

interface LearningPathGridProps {
    data: LearningPath[];
    isLoading?: boolean;
    onTogglePublish: (id: number) => void;
    onDelete: (id: number) => void;
    selectedIds?: number[];
    onSelect?: (id: number, selected: boolean) => void;
    onPreview?: (learningPath: LearningPath) => void;
}

export function LearningPathGrid({
    data,
    isLoading,
    onTogglePublish,
    onDelete,
    selectedIds = [],
    onSelect,
    onPreview
}: LearningPathGridProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="overflow-hidden rounded-2xl border border-border/40 bg-card p-0 shadow-sm"
                    >
                        <Skeleton className="h-32 w-full rounded-none" />
                        <div className="p-5 space-y-3.5">
                            <Skeleton className="h-4 w-3/4 rounded-md" />
                            <Skeleton className="h-3 w-full rounded-md" />
                            <div className="flex gap-4 pt-3 border-t border-border/20">
                                <Skeleton className="h-3 w-12 rounded-md" />
                                <Skeleton className="h-3 w-12 rounded-md" />
                                <Skeleton className="h-3 w-12 rounded-md" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return null;
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((lp) => (
                <LearningPathCard
                    key={lp.id}
                    learningPath={lp}
                    isSelected={selectedIds.includes(lp.id)}
                    onSelect={(selected) => onSelect?.(lp.id, selected)}
                    onTogglePublish={() => onTogglePublish(lp.id)}
                    onDelete={() => onDelete(lp.id)}
                    onPreview={() => onPreview?.(lp)}
                />
            ))}
        </div>
    );
}

interface LearningPathCardProps {
    learningPath: LearningPath;
    isSelected?: boolean;
    onSelect?: (selected: boolean) => void;
    onTogglePublish: () => void;
    onDelete: () => void;
    onPreview: () => void;
}

function LearningPathCard({
    learningPath: lp,
    isSelected,
    onSelect,
    onTogglePublish,
    onDelete,
    onPreview
}: LearningPathCardProps) {
    const t = useTranslations("learningPaths");
    const levelStyle = LEVEL_COLORS[lp.level];
    const lessonProgress =
        lp.totalLessonCount > 0
            ? Math.round((lp.publishedLessonCount / lp.totalLessonCount) * 100)
            : 0;

    const getLevelText = (level: Level) => {
        switch (level) {
            case "BEGINNER": return t("beginner");
            case "INTERMEDIATE": return t("intermediate");
            case "ADVANCED": return t("advanced");
            default: return level;
        }
    };

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-b from-card to-card/95 transition-all duration-300 flex flex-col justify-between",
                "hover:-translate-y-1 hover:shadow-md hover:border-border/70",
                isSelected && "ring-2 ring-primary/40 border-primary/40"
            )}
        >
            <div className="absolute inset-0 noise-overlay opacity-[0.012] pointer-events-none" />

            {/* Selection checkbox */}
            <div className="absolute left-3 top-3 z-10" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect?.(!!checked)}
                    aria-label={`Select ${lp.name}`}
                    className="bg-background/80 backdrop-blur-sm border-border/50 rounded-md"
                />
            </div>

            {/* Clickable card body */}
            <Link href={`/learning-paths/${lp.id}`} className="block flex-1">
                {/* Thumbnail */}
                <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-muted/50 to-muted border-b border-border/20">
                    {lp.thumbnailUrl ? (
                        <Image
                            src={lp.thumbnailUrl}
                            alt={lp.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-muted/40">
                            <GraduationCapIcon className="size-12 text-muted-foreground/20" />
                        </div>
                    )}

                    {/* Level badge */}
                    <div className="absolute right-3 top-3">
                        <span
                            className={cn(
                                "inline-flex items-center rounded-lg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm",
                                levelStyle.bg,
                                levelStyle.text
                            )}
                        >
                            {getLevelText(lp.level)}
                        </span>
                    </div>

                    {/* Status badge */}
                    <div className="absolute left-3 bottom-3">
                        {lp.isPublished ? (
                            <Badge className="bg-emerald-500/90 hover:bg-emerald-500/90 text-white text-[9px] font-bold py-0.5 px-2 rounded-lg border-0 shadow-sm">
                                <GlobeIcon className="mr-1 size-2.5" />
                                {t("published")}
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-[9px] font-bold py-0.5 px-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/20 text-muted-foreground">
                                {t("draft")}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-2">
                    <h3 className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                        {lp.name}
                    </h3>
                    {lp.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground/90 leading-relaxed min-h-[36px]">
                            {lp.description}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="mt-2.5 flex items-center gap-3 text-[11px] font-semibold text-muted-foreground/80">
                        <span className="inline-flex items-center gap-1">
                            <LayersIcon className="size-3.5" />
                            {t("topics", { count: lp.topicCount })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <BookOpenIcon className="size-3.5" />
                            {lp.publishedLessonCount}/{lp.totalLessonCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <UsersIcon className="size-3.5" />
                            {lp.enrollmentCount}
                        </span>
                    </div>

                    {/* Progress */}
                    {lp.totalLessonCount > 0 && (
                        <div className="mt-3.5">
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted/80 border border-border/20">
                                <div
                                    className="h-full rounded-full bg-primary/70 transition-all duration-500"
                                    style={{ width: `${lessonProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Link>

            {/* Action buttons — always visible */}
            <div
                className="flex items-center justify-between border-t border-border/20 px-4 py-2 bg-muted/10 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg size-8 transition-colors"
                        onClick={onPreview}
                        title={t("preview")}
                    >
                        <EyeIcon className="size-3.5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={`/learning-paths/${lp.id}`} />}
                        className="text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-lg size-8 transition-colors"
                        title={t("edit")}
                    >
                        <Pencil className="size-3.5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onTogglePublish}
                        className={cn(
                            "rounded-lg size-8 transition-colors",
                            lp.isPublished
                                ? "text-emerald-600 hover:text-amber-600 hover:bg-amber-500/10 dark:text-emerald-400 dark:hover:text-amber-400"
                                : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                        )}
                        title={lp.isPublished ? t("unpublish") : t("publish")}
                    >
                        <Rocket className="size-3.5" />
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onDelete}
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg size-8 transition-colors"
                    title={t("delete")}
                >
                    <Trash2 className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}
