"use client";

import Link from "next/link";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Checkbox} from "@/components/ui/checkbox";
import {
    BookOpenIcon,
    GlobeIcon,
    GraduationCapIcon,
    LayersIcon,
    Pencil,
    Rocket,
    Trash2,
    UsersIcon,
} from "lucide-react";
import {LearningPath, Level} from "@/types/learning-path";
import {Skeleton} from "@/components/ui/skeleton";

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
                                 }: LearningPathGridProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: 6}).map((_, i) => (
                    <div
                        key={i}
                        className="overflow-hidden rounded-xl border bg-card"
                    >
                        <Skeleton className="h-32 w-full rounded-none"/>
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-5 w-3/4"/>
                            <Skeleton className="h-4 w-full"/>
                            <div className="flex gap-4 pt-2">
                                <Skeleton className="h-4 w-16"/>
                                <Skeleton className="h-4 w-16"/>
                                <Skeleton className="h-4 w-16"/>
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
}

function LearningPathCard({
                              learningPath: lp,
                              isSelected,
                              onSelect,
                              onTogglePublish,
                              onDelete,
                          }: LearningPathCardProps) {
    const levelStyle = LEVEL_COLORS[lp.level];
    const lessonProgress =
        lp.totalLessonCount > 0
            ? Math.round((lp.publishedLessonCount / lp.totalLessonCount) * 100)
            : 0;

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl border bg-card transition-all duration-200",
                "hover:shadow-md hover:border-border/80",
                isSelected && "ring-2 ring-primary/50 border-primary/50"
            )}
        >
            {/* Selection checkbox */}
            <div className="absolute left-3 top-3 z-10" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect?.(checked)}
                    aria-label={`Select ${lp.name}`}
                    className="bg-background/80 backdrop-blur-sm border-border"
                />
            </div>

            {/* Clickable card body */}
            <Link href={`/dashboard/learning-paths/${lp.id}`} className="block">
                {/* Thumbnail */}
                <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
                    {lp.thumbnailUrl ? (
                        <Image
                            src={lp.thumbnailUrl}
                            alt={lp.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center">
                            <GraduationCapIcon className="size-10 text-muted-foreground/30"/>
                        </div>
                    )}

                    {/* Level badge */}
                    <div className="absolute right-3 top-3">
                        <span
                            className={cn(
                                "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                levelStyle.bg,
                                levelStyle.text
                            )}
                        >
                            {lp.level.charAt(0) + lp.level.slice(1).toLowerCase()}
                        </span>
                    </div>

                    {/* Status badge */}
                    <div className="absolute left-3 bottom-3">
                        {lp.isPublished ? (
                            <Badge className="bg-emerald-500/90 text-white text-[10px] border-0">
                                <GlobeIcon className="mr-1 size-2.5"/>
                                Published
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">
                                Draft
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {lp.name}
                    </h3>
                    {lp.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                            {lp.description}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <LayersIcon className="size-3.5"/>
                            {lp.topicCount} topics
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <BookOpenIcon className="size-3.5"/>
                            {lp.publishedLessonCount}/{lp.totalLessonCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <UsersIcon className="size-3.5"/>
                            {lp.enrollmentCount}
                        </span>
                    </div>

                    {/* Progress */}
                    {lp.totalLessonCount > 0 && (
                        <div className="mt-3">
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary/70 transition-all duration-500"
                                    style={{width: `${lessonProgress}%`}}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Link>

            {/* Action buttons — always visible */}
            <div
                className="flex items-center justify-between border-t px-3 py-2"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={`/dashboard/learning-paths/${lp.id}`}/>}
                        className="text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 dark:hover:text-blue-400"
                        title="Edit"
                    >
                        <Pencil className="size-3.5"/>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onTogglePublish}
                        className={
                            lp.isPublished
                                ? "text-emerald-600 hover:text-amber-600 hover:bg-amber-500/10 dark:text-emerald-400 dark:hover:text-amber-400"
                                : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                        }
                        title={lp.isPublished ? "Unpublish" : "Publish"}
                    >
                        <Rocket className="size-3.5"/>
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onDelete}
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-500/10 dark:hover:text-red-400"
                    title="Delete"
                >
                    <Trash2 className="size-3.5"/>
                </Button>
            </div>
        </div>
    );
}
