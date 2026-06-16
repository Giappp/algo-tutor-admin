"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Code2, FileQuestion, GlobeIcon, Pencil, PlaySquare, Rocket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Difficulty, Lesson, LessonType } from "@/types/learning-path";

const LESSON_TYPE_CONFIG: Record<LessonType, { icon: React.ElementType; label: string; className: string }> = {
    THEORY: {
        icon: BookOpen,
        label: "Theory",
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    QUIZ: {
        icon: FileQuestion,
        label: "Quiz",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    CODING: {
        icon: Code2,
        label: "Coding",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    VIDEO: {
        icon: PlaySquare,
        label: "Video",
        className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    },
};

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; className: string }> = {
    EASY: {
        label: "Easy",
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    },
    MEDIUM: {
        label: "Medium",
        className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    },
    HARD: {
        label: "Hard",
        className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
};

interface LessonListItemProps {
    lesson: Lesson;
    pathId: number;
    onTogglePublish: (id: number) => void;
    onDelete: (id: number) => void;
    isTogglePublishPending?: boolean;
    isDeletePending?: boolean;
}

export function LessonListItem({
    lesson,
    pathId,
    onTogglePublish,
    onDelete,
}: LessonListItemProps) {
    const router = useRouter();
    const typeConfig = LESSON_TYPE_CONFIG[lesson.type];
    const TypeIcon = typeConfig.icon;
    const difficultyConfig = lesson.difficulty ? DIFFICULTY_CONFIG[lesson.difficulty] : null;

    return (
        <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => router.push(`/learning-paths/${pathId}/lessons/${lesson.id}`)}
        >
            {/* Type icon */}
            <div className={`shrink-0 flex items-center justify-center size-8 rounded-lg border ${typeConfig.className}`}>
                <TypeIcon className="size-4" />
            </div>

            {/* Title + metadata */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                        {lesson.title}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    {/* Type badge */}
                    <span className={`text-[11px] font-medium rounded-md px-1.5 py-0.5 border ${typeConfig.className}`}>
                        {typeConfig.label}
                    </span>

                    {/* Difficulty badge */}
                    {difficultyConfig && (
                        <span className={`text-[11px] font-medium rounded-md px-1.5 py-0.5 border ${difficultyConfig.className}`}>
                            {difficultyConfig.label}
                        </span>
                    )}

                    {/* Status */}
                    {lesson.isPublished ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] px-1.5 py-0">
                            <GlobeIcon className="mr-0.5 size-2.5" />
                            Live
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                            Draft
                        </Badge>
                    )}
                </div>
            </div>

            {/* Actions — always visible */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onTogglePublish(lesson.id)}
                    className={
                        lesson.isPublished
                            ? "text-emerald-600 border-emerald-500/30 hover:text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/30 dark:text-emerald-400"
                            : "text-muted-foreground border-border hover:text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                    }
                    title={lesson.isPublished ? "Unpublish" : "Publish"}
                    disabled={!lesson.isPublished && lesson.type === "VIDEO" && lesson.processingStatus !== "READY"}
                >
                    <Rocket className="size-3.5" />
                </Button>
                <Button
                    variant="outline"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/learning-paths/${pathId}/lessons/${lesson.id}`} />}
                    className="text-blue-600 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/40 dark:text-blue-400"
                    title="Edit"
                >
                    <Pencil className="size-3.5" />
                </Button>
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onDelete(lesson.id)}
                    className="text-red-500 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-600 dark:text-red-400"
                    title="Delete"
                >
                    <Trash2 className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}
