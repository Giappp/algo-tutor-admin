import Link from "next/link";
import {BookOpen, Code2, FileQuestion, Pencil, Rocket, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Difficulty, Lesson, LessonType} from "@/types/learning-path";

const LESSON_TYPE_ICONS: Record<LessonType, React.ElementType> = {
    THEORY: BookOpen,
    QUIZ: FileQuestion,
    CODING: Code2,
};

const LESSON_TYPE_COLORS: Record<LessonType, { bg: string; text: string; border: string; label: string; hue: number }> = {
    THEORY: {
        bg: "bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/25",
        label: "Theory",
        hue: 265,
    },
    QUIZ: {
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/25",
        label: "Quiz",
        hue: 40,
    },
    CODING: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/25",
        label: "Coding",
        hue: 170,
    },
};

const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; border: string; label: string }> = {
    EASY: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/25",
        label: "Easy",
    },
    MEDIUM: {
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/25",
        label: "Medium",
    },
    HARD: {
        bg: "bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-500/25",
        label: "Hard",
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
                                   isTogglePublishPending = false,
                                   isDeletePending = false,
                               }: LessonListItemProps) {
    const typeConfig = LESSON_TYPE_COLORS[lesson.type];
    const TypeIcon = LESSON_TYPE_ICONS[lesson.type];
    const difficultyConfig = lesson.difficulty ? DIFFICULTY_COLORS[lesson.difficulty] : null;

    return (
        <div
            className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/40 transition-all group gap-3"
        >
            <div className="flex items-center gap-2.5 flex-1 min-w-0 flex-wrap">
                {/* Type icon — colored circle with icon */}
                <div className={`shrink-0 flex items-center justify-center size-9 rounded-xl border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border} group-hover:scale-110 transition-transform duration-200`}>
                    <TypeIcon className="size-4" />
                </div>

                {/* Type label */}
                <span
                    className={`hidden xs:inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}>
                    {typeConfig.label}
                </span>

                {/* Title */}
                <span className="font-semibold text-sm text-foreground truncate max-w-xs">
                    {lesson.title}
                </span>

                {/* Difficulty badge */}
                {difficultyConfig && (
                    <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border ${difficultyConfig.bg} ${difficultyConfig.text} ${difficultyConfig.border}`}>
                        {difficultyConfig.label}
                    </span>
                )}

                {/* Published status */}
                {lesson.isPublished ? (
                    <span
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        <span className="size-1.5 rounded-full bg-current shrink-0 animate-published-pulse"/>
                        Published
                    </span>
                ) : (
                    <span
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground border border-transparent">
                        Draft
                    </span>
                )}
            </div>

            {/* Action buttons — always visible */}
            <div className="flex items-center gap-1 shrink-0">
                <Button
                    size="icon-sm"
                    variant={"outline"}
                    onClick={() => onTogglePublish(lesson.id)}
                    disabled={isTogglePublishPending}
                    className="text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 border-amber-500/25 hover:border-amber-500/40 transition-all"
                    title={lesson.isPublished ? "Unpublish" : "Publish"}
                >
                    <Rocket className="size-3.5"/>
                </Button>
                <Button
                    size="icon-sm"
                    variant={"outline"}
                    nativeButton={false}
                    render={
                        <Link href={`/dashboard/learning-paths/${pathId}/lessons/${lesson.id}`}/>
                    }
                    className="text-chart-1 hover:text-chart-1/80 hover:bg-chart-1/10 border-chart-1/25 hover:border-chart-1/40 transition-all"
                    title="Edit lesson"
                >
                    <Pencil className="size-3.5"/>
                </Button>
                <Button
                    size="icon-sm"
                    variant={"outline"}
                    onClick={() => onDelete(lesson.id)}
                    disabled={isDeletePending}
                    className="text-red-400/60 hover:text-destructive hover:bg-destructive/10"
                    title="Delete lesson"
                >
                    <Trash2 className="size-3.5"/>
                </Button>
            </div>
        </div>
    );
}
