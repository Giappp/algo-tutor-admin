"use client";

import { BookOpen, ChevronDown, Code2, FileQuestion, Plus, GraduationCap, PlusCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLessonsByTopic } from "@/hooks/use-lessons";
import { Lesson, Topic } from "@/types/learning-path";
import { SidebarLessonList } from "./sidebar-lesson-list";

// Color & icon mapping for lesson types
const LESSON_TYPE_CONFIG = {
    THEORY: {
        icon: BookOpen,
        iconClass: "text-blue-500",
        bgClass: "bg-blue-500/10 border-blue-500/20",
    },
    QUIZ: {
        icon: FileQuestion,
        iconClass: "text-amber-500",
        bgClass: "bg-amber-500/10 border-amber-500/20",
    },
    CODING: {
        icon: Code2,
        iconClass: "text-emerald-500",
        bgClass: "bg-emerald-500/10 border-emerald-500/20",
    },
};

interface ActiveItem {
    type: "path" | "topic" | "lesson" | "create-lesson";
    id?: number;
    topicId?: number;
}

interface OutlineTreeSidebarProps {
    topics: Topic[];
    pathId: number;
    pathName: string;
    isPremium: boolean;
    level: string;
    activeItem: ActiveItem;
    setActiveItem: (item: ActiveItem) => void;
    onAddTopic: () => void;
}

export function OutlineTreeSidebar({
    topics,
    pathId,
    pathName,
    isPremium,
    level,
    activeItem,
    setActiveItem,
    onAddTopic,
}: OutlineTreeSidebarProps) {
    return (
        <div className="flex flex-col h-full bg-card">
            {/* Learning Path Header Card */}
            <div
                onClick={() => setActiveItem({ type: "path" })}
                className={cn(
                    "p-4 border-b transition-all duration-200 cursor-pointer hover:bg-muted/30 select-none group",
                    activeItem.type === "path"
                        ? "bg-primary/5 border-l-4 border-l-primary border-b-primary/10"
                        : "border-l-4 border-l-transparent"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center border transition-all shadow-sm",
                        activeItem.type === "path"
                            ? "bg-primary text-primary-foreground border-primary/20"
                            : "bg-muted/80 text-muted-foreground border-border group-hover:bg-muted group-hover:text-foreground"
                    )}>
                        <GraduationCap className="size-5.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {pathName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {level}
                            </span>
                            <span className="text-muted-foreground/40 text-[10px]">•</span>
                            <span className={cn(
                                "text-[10px] font-medium px-1.5 py-0.2 rounded-md border",
                                isPremium
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            )}>
                                {isPremium ? "Premium" : "Free"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tree Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Course Outline
                    </span>
                    <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                        {topics.length} Topics
                    </span>
                </div>

                {topics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-border gap-2">
                        <p className="text-xs text-muted-foreground">No topics created yet.</p>
                        <Button size="xs" variant="outline" onClick={onAddTopic} className="h-7 text-xs">
                            <Plus className="size-3.5 mr-1" />
                            Add First Topic
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {topics.map((topic) => (
                            <SidebarTopicItem
                                key={topic.id}
                                topic={topic}
                                activeItem={activeItem}
                                setActiveItem={setActiveItem}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Topic Action Button */}
            <div className="p-3 border-t bg-muted/20">
                <Button
                    onClick={onAddTopic}
                    className="w-full justify-center h-9 text-xs"
                    variant="outline"
                >
                    <PlusCircle className="size-4 mr-1.5 text-primary" />
                    Create New Topic
                </Button>
            </div>
        </div>
    );
}

// Internal Topic Item with collapsible lessons
function SidebarTopicItem({
    topic,
    activeItem,
    setActiveItem,
}: {
    topic: Topic;
    activeItem: ActiveItem;
    setActiveItem: (item: ActiveItem) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { data: lessonsData } = useLessonsByTopic(topic.id);
    const lessons: Lesson[] = lessonsData?.data ?? [];

    const isTopicActive = activeItem.type === "topic" && activeItem.id === topic.id;

    return (
        <div className="rounded-xl border overflow-hidden bg-background/50 hover:border-border/80 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            {/* Topic Header Row */}
            <div
                className={cn(
                    "flex items-center gap-1.5 p-2.5 transition-all select-none",
                    isTopicActive
                        ? "bg-primary/5 text-primary"
                        : "hover:bg-muted/20"
                )}
            >
                {/* Collapse button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="shrink-0 size-6 rounded-md hover:bg-muted/80 flex items-center justify-center transition-colors"
                >
                    <ChevronDown
                        className={cn(
                            "size-3.5 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180"
                        )}
                    />
                </button>

                {/* Topic Info click triggers editing */}
                <div
                    onClick={() => setActiveItem({ type: "topic", id: topic.id })}
                    className="flex-1 min-w-0 cursor-pointer"
                >
                    <div className="flex items-center gap-1.5">
                        <span className="shrink-0 flex items-center justify-center size-5 rounded-md bg-muted text-[10px] font-bold border">
                            {topic.displayOrder}
                        </span>
                        <span className="font-semibold text-xs text-foreground truncate block">
                            {topic.name}
                        </span>
                    </div>
                </div>

                {/* Inline plus to add lesson */}
                <button
                    onClick={() => setActiveItem({ type: "create-lesson", topicId: topic.id })}
                    className="shrink-0 size-6 rounded-md hover:bg-emerald-500/10 hover:text-emerald-600 flex items-center justify-center text-muted-foreground transition-colors"
                    title="Add Lesson"
                >
                    <Plus className="size-3.5" />
                </button>
            </div>

            {/* Collapsible Lessons list */}
            {isExpanded && (
                <div className="border-t border-muted/50 p-1.5 bg-muted/5 space-y-1">
                    {lessons.length === 0 ? (
                        <div
                            onClick={() => setActiveItem({ type: "create-lesson", topicId: topic.id })}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-emerald-500/5 hover:text-emerald-600 group transition-all"
                        >
                            <PlusCircle className="size-3.5 text-muted-foreground group-hover:text-emerald-500 shrink-0" />
                            <span className="text-[11px] text-muted-foreground group-hover:text-emerald-600 font-medium">
                                Create first lesson...
                            </span>
                        </div>
                    ) : (
                        <>
                            <SidebarLessonList
                                topicId={topic.id}
                                lessons={lessons}
                                activeItem={activeItem}
                                setActiveItem={setActiveItem}
                            />

                            {/* Fast Add Lesson link at the bottom of the list */}
                            <div
                                onClick={() => setActiveItem({ type: "create-lesson", topicId: topic.id })}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-muted/30 group transition-all"
                            >
                                <Plus className="size-3 text-muted-foreground shrink-0" />
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                    Add Lesson
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
