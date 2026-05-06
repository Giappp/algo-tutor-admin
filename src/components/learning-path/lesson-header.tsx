"use client";

import Link from "next/link";
import {ArrowLeft, BookOpen, Code2, Eye, FileQuestion, Pencil, Rocket} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Difficulty, LessonType} from "@/types/learning-path";

const LESSON_TYPE_CONFIG: Record<LessonType, {
    icon: React.ElementType;
    bgGradient: string;
    borderColor: string;
    badgeClass: string;
}> = {
    THEORY: {
        icon: BookOpen,
        bgGradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
        borderColor: "border-l-blue-500",
        badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    QUIZ: {
        icon: FileQuestion,
        bgGradient: "from-amber-500/10 via-orange-500/5 to-transparent",
        borderColor: "border-l-amber-500",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    CODING: {
        icon: Code2,
        bgGradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
        borderColor: "border-l-emerald-500",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
};

const DIFFICULTY_CONFIG: Record<Difficulty, { class: string; label: string }> = {
    EASY: {class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", label: "Easy"},
    MEDIUM: {class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", label: "Medium"},
    HARD: {class: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", label: "Hard"},
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
    onEdit: () => void;
    onTogglePublish: () => void;
    isEditPending?: boolean;
}

export function LessonHeader({
                                 lesson,
                                 learningPathId,
                                 onEdit,
                                 onTogglePublish,
                                 isEditPending = false,
                             }: LessonHeaderProps) {
    const config = LESSON_TYPE_CONFIG[lesson.type];
    const TypeIcon = config.icon;

    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.bgGradient} p-6`}
        >
            {/* Decorative accent */}
            <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${config.borderColor} bg-gradient-to-b from-transparent via-current to-transparent opacity-60`}/>

            {/* Decorative glow */}
            <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.08),transparent_50%)] pointer-events-none"/>

            <div className="relative flex items-start justify-between gap-4">
                {/* Left section: Back + Lesson info */}
                <div className="flex items-start gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        nativeButton={false}
                        render={<Link href={`/dashboard/learning-paths/${learningPathId}`}/>}
                        className="shrink-0 mt-1"
                    >
                        <ArrowLeft className="size-5"/>
                    </Button>

                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                            className={`shrink-0 flex items-center justify-center size-12 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm border border-border/50`}>
                            <TypeIcon className={`size-6 ${config.badgeClass.split(" ")[1]}`}/>
                        </div>

                        {/* Title & Meta */}
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate max-w-md">
                                {lesson.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Type badge */}
                                <Badge variant="outline" className={config.badgeClass}>
                                    {lesson.type.charAt(0) + lesson.type.slice(1).toLowerCase()}
                                </Badge>

                                {/* Difficulty badge */}
                                {lesson.difficulty && (
                                    <Badge variant="outline" className={DIFFICULTY_CONFIG[lesson.difficulty].class}>
                                        {DIFFICULTY_CONFIG[lesson.difficulty].label}
                                    </Badge>
                                )}

                                {/* Publish status */}
                                <Badge
                                    variant={lesson.isPublished ? "default" : "outline"}
                                    className={lesson.isPublished
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : "text-muted-foreground"
                                    }
                                >
                                    {lesson.isPublished ? "Published" : "Draft"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right section: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Preview link */}
                    <Button
                        variant="ghost"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={`/lessons/${lesson.slug || lesson.id}`} target="_blank"/>}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Eye className="size-4 mr-1.5"/>
                        Preview
                    </Button>

                    {/* Toggle publish */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onTogglePublish}
                        disabled={isEditPending}
                    >
                        <Rocket className="size-4 mr-1.5"/>
                        {lesson.isPublished ? "Unpublish" : "Publish"}
                    </Button>

                    {/* Edit */}
                    <Button size="sm" onClick={onEdit}>
                        <Pencil className="size-4 mr-1.5"/>
                        Edit
                    </Button>

                    {/* More actions dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            {/* <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="size-4"/>
                                <span className="sr-only">More options</span>
                            </Button>*/}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Pencil className="size-4 mr-2"/>
                                Edit Lesson
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onTogglePublish}>
                                <Rocket className="size-4 mr-2"/>
                                {lesson.isPublished ? "Unpublish" : "Publish"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                                nativeButton={false}
                                render={<Link href={`/lessons/${lesson.slug || lesson.id}`} target="_blank"/>}
                                className="text-destructive focus:text-destructive"
                            >
                                <Eye className="size-4 mr-2"/>
                                View Public Page
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}

export {LESSON_TYPE_CONFIG, DIFFICULTY_CONFIG};
