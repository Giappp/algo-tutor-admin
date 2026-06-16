"use client";

import { useTranslations } from "next-intl";
import { Draggable } from "@hello-pangea/dnd";
import { BookOpen, Code2, FileQuestion, GripVertical, PlaySquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lesson } from "@/types/learning-path";

// Color & icon mapping for lesson types
const LESSON_TYPE_CONFIG = {
    THEORY: {
        icon: BookOpen,
        iconClass: "text-blue-500",
        bgClass: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    },
    QUIZ: {
        icon: FileQuestion,
        iconClass: "text-amber-500",
        bgClass: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    },
    CODING: {
        icon: Code2,
        iconClass: "text-emerald-500",
        bgClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    },
    VIDEO: {
        icon: PlaySquare,
        iconClass: "text-violet-500",
        bgClass: "bg-violet-500/10 border-violet-500/20 text-violet-500",
    },
};

interface SidebarLessonItemProps {
    lesson: Lesson;
    index: number;
    isActive: boolean;
    onSelect: () => void;
}

export function SidebarLessonItem({
    lesson,
    index,
    isActive,
    onSelect,
}: SidebarLessonItemProps) {
    const t = useTranslations("learningPaths");
    const config = LESSON_TYPE_CONFIG[lesson.type];
    const Icon = config.icon;

    return (
        <Draggable draggableId={String(lesson.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onClick={onSelect}
                    className={cn(
                        "flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200 select-none group border bg-background/40",
                        isActive
                            ? "bg-card border-border/80 shadow-[0_2px_4px_rgba(0,0,0,0.03)] font-semibold"
                            : "hover:bg-muted/40 border-transparent",
                        snapshot.isDragging && "bg-muted shadow-md border-primary/30 scale-[1.01] rotate-[0.5deg]"
                    )}
                >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Drag Handle Grip - appears on item hover */}
                        <div
                            {...provided.dragHandleProps}
                            className="size-5 flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground/70 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0"
                            title="Drag to reorder"
                        >
                            <GripVertical className="size-3.5" />
                        </div>

                        {/* Type Indicator Icon */}
                        <div className={cn(
                            "size-5.5 rounded-md border flex items-center justify-center shrink-0 shadow-sm bg-background",
                            config.bgClass
                        )}>
                            <Icon className="size-3" />
                        </div>

                        {/* Title */}
                        <span className={cn(
                            "text-[11px] truncate flex-1 leading-tight",
                            isActive ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"
                        )}>
                            {lesson.title}
                        </span>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 flex items-center pr-1">
                        {lesson.isPublished ? (
                            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" title={t("published")} />
                        ) : (
                            <span className="size-1.5 rounded-full bg-muted-foreground/30" title={t("draft")} />
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
}
