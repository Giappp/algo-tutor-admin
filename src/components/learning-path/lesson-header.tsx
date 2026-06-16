"use client";

import Link from "next/link";
import {ArrowLeft, BookOpen, Code2, Eye, FileQuestion, PlaySquare, Rocket} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {InlineEdit} from "@/components/ui/inline-edit";
import {Difficulty, LessonType} from "@/types/learning-path";
import type {ReactNode} from "react";

const LESSON_TYPE_CONFIG: Record<LessonType, {icon: React.ElementType}> = {
    THEORY: {icon: BookOpen},
    QUIZ: {icon: FileQuestion},
    CODING: {icon: Code2},
    VIDEO: {icon: PlaySquare},
};

const DIFFICULTY_CONFIG: Record<Difficulty, {class: string; translationKey: "easy" | "medium" | "hard"}> = {
    EASY: {class: "border-emerald-500/20 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400", translationKey: "easy"},
    MEDIUM: {class: "border-amber-500/20 bg-amber-500/8 text-amber-700 dark:text-amber-400", translationKey: "medium"},
    HARD: {class: "border-red-500/20 bg-red-500/8 text-red-700 dark:text-red-400", translationKey: "hard"},
};

interface LessonHeaderProps {
    lesson: {
        id: number;
        title: string;
        type: LessonType;
        difficulty?: Difficulty;
        isPublished: boolean;
        slug?: string;
    };
    learningPathId: number;
    onTogglePublish: () => void;
    onTitleChange?: (newTitle: string) => void;
    isEditPending?: boolean;
    action?: ReactNode;
    publishDisabled?: boolean;
    publishDisabledReason?: string;
}

export function LessonHeader({
    lesson,
    learningPathId,
    onTogglePublish,
    onTitleChange,
    isEditPending = false,
    action,
    publishDisabled = false,
    publishDisabledReason,
}: LessonHeaderProps) {
    const t = useTranslations("learningPaths");
    const tLessonForm = useTranslations("lessonForm");
    const TypeIcon = LESSON_TYPE_CONFIG[lesson.type].icon;
    const typeKey = lesson.type === "THEORY" ? "theory" : lesson.type === "QUIZ" ? "quiz" : lesson.type === "CODING" ? "coding" : "video";

    return (
        <header className="relative overflow-hidden rounded-2xl border border-border/70 bg-card px-4 py-5 shadow-[0_18px_50px_-44px_rgba(0,0,0,0.5)] sm:px-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"/>
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={<Link href={`/learning-paths/${learningPathId}`}/>}
                        className="mt-1 shrink-0"
                    >
                        <ArrowLeft className="size-4"/>
                    </Button>

                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                        <div className="hidden size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.06] text-primary sm:flex">
                            <TypeIcon className="size-5"/>
                        </div>
                        <div className="min-w-0 pt-0.5">
                            <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <span className="size-1.5 rounded-full bg-primary"/>
                                {t(typeKey)}
                            </p>
                            {onTitleChange ? (
                                <InlineEdit
                                    value={lesson.title}
                                    onSave={onTitleChange}
                                    placeholder="Lesson title..."
                                    disabled={isEditPending}
                                    className="max-w-2xl text-xl font-semibold tracking-tight sm:text-2xl"
                                />
                            ) : (
                                <h1 className="max-w-2xl truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                    {lesson.title}
                                </h1>
                            )}
                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                {lesson.difficulty && (
                                    <Badge variant="outline" className={DIFFICULTY_CONFIG[lesson.difficulty].class}>
                                        {tLessonForm(`difficulty.${DIFFICULTY_CONFIG[lesson.difficulty].translationKey}`)}
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className={lesson.isPublished
                                        ? "border-primary/20 bg-primary/[0.06] text-primary"
                                        : "border-border/70 bg-muted/35 text-muted-foreground"
                                    }
                                >
                                    {lesson.isPublished ? t("published") : t("draft")}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-14 lg:pl-0">
                    {action}
                    <Button
                        variant="ghost"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={`/lessons/${lesson.slug || lesson.id}`} target="_blank"/>}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Eye className="size-4"/>
                        {t("preview")}
                    </Button>
                    <Button
                        variant={lesson.isPublished ? "outline" : "default"}
                        size="sm"
                        onClick={onTogglePublish}
                        disabled={isEditPending || publishDisabled}
                        title={publishDisabledReason}
                    >
                        <Rocket className="size-4"/>
                        {lesson.isPublished ? t("unpublish") : t("publish")}
                    </Button>
                </div>
            </div>
        </header>
    );
}

export {LESSON_TYPE_CONFIG, DIFFICULTY_CONFIG};
