"use client";

import Link from "next/link";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Checkbox} from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    BookOpenIcon,
    EyeIcon,
    GraduationCapIcon,
    LayersIcon,
    MoreHorizontal,
    Pencil,
    Rocket,
    Trash2,
    UsersIcon,
} from "lucide-react";
import {LearningPath, Level} from "@/types/learning-path";
import {Skeleton} from "@/components/ui/skeleton";

const LEVEL_COLORS: Record<Level, { bg: string; text: string; border: string }> = {
    BEGINNER: {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20",
    },
    INTERMEDIATE: {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/20",
    },
    ADVANCED: {
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-500/20",
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
                                     onPreview,
                                 }: LearningPathGridProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: 6}).map((_, i) => (
                    <div
                        key={i}
                        className="group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300"
                    >
                        <Skeleton className="h-36 w-full rounded-none"/>
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
                              onPreview,
                          }: LearningPathCardProps) {
    const levelStyle = LEVEL_COLORS[lp.level];
    lp.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    const lessonProgress =
        lp.totalLessonCount > 0
            ? Math.round((lp.publishedLessonCount / lp.totalLessonCount) * 100)
            : 0;

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300",
                "hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50",
                "hover:-translate-y-1 hover:border-indigo-500/20",
                isSelected && "ring-2 ring-indigo-500/50 border-indigo-500/50"
            )}
        >
            {/* Selection checkbox */}
            <div className="absolute left-3 top-3 z-10">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect?.(checked)}
                    aria-label={`Select ${lp.name}`}
                    className="bg-background/80 backdrop-blur-sm"
                />
            </div>

            {/* Thumbnail */}
            <div
                className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10">
                {lp.thumbnailUrl ? (
                    <Image
                        src={lp.thumbnailUrl}
                        alt={lp.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <GraduationCapIcon className="size-12 text-indigo-500/30 dark:text-indigo-400/30"/>
                    </div>
                )}

                {/* Level badge */}
                <div className="absolute right-3 top-3">
                    <span
                        className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                            levelStyle.bg,
                            levelStyle.text
                        )}
                    >
                        {lp.level.charAt(0) + lp.level.slice(1).toLowerCase()}
                    </span>
                </div>

                {/* Publish status badge */}
                {!lp.isPublished && (
                    <div className="absolute left-3 bottom-3">
                        <Badge variant="secondary" className="text-[10px]">
                            Draft
                        </Badge>
                    </div>
                )}

                {/* Hover overlay with actions */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                        <Button
                            size="sm"
                            nativeButton={true}
                            variant="secondary"
                            className="h-8 flex-1 bg-white/90 backdrop-blur-sm hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-700"
                            onClick={onPreview}
                        >
                            <EyeIcon className="mr-1 size-3"/>
                            Preview
                        </Button>
                        <Button
                            size="sm"
                            nativeButton={false}
                            variant="secondary"
                            className="h-8 flex-1 bg-white/90 backdrop-blur-sm hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-700"
                            render={<Link href={`/dashboard/learning-paths/${lp.id}`}/>}
                        >
                            <Pencil className="mr-1 size-3"/>
                            Edit
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title & Description */}
                <div className="mb-3">
                    <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
                        {lp.name}
                    </h3>
                    {lp.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {lp.description}
                        </p>
                    )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <LayersIcon className="size-3.5"/>
                        <span>{lp.topicCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpenIcon className="size-3.5"/>
                        <span>{lp.publishedLessonCount}/{lp.totalLessonCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <UsersIcon className="size-3.5"/>
                        <span>{lp.enrollmentCount}</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Content published</span>
                        <span>{lessonProgress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{width: `${lessonProgress}%`}}
                        />
                    </div>
                </div>

                {/* Actions row */}
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onTogglePublish}
                            title={lp.isPublished ? "Unpublish" : "Publish"}
                            className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            <Rocket className="size-4"/>
                        </Button>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreHorizontal className="size-4"/>
                            <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onPreview}>
                                <EyeIcon data-icon="inline-start" className="size-4"/>
                                Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem render={<Link href={`/dashboard/learning-paths/${lp.id}`}/>}>
                                <Pencil data-icon="inline-start" className="size-4"/>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onTogglePublish}>
                                <Rocket data-icon="inline-start" className="size-4"/>
                                Toggle Publish
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                                onClick={onDelete}
                                variant="destructive"
                            >
                                <Trash2 data-icon="inline-start" className="size-4"/>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
