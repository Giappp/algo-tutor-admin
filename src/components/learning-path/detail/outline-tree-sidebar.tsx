"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Plus, GraduationCap, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLessonsByTopic } from "@/hooks/use-lessons";
import { Lesson, Topic } from "@/types/learning-path";
import { SidebarLessonList } from "./sidebar-lesson-list";

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
    pathName,
    isPremium,
    level,
    activeItem,
    setActiveItem,
    onAddTopic,
}: OutlineTreeSidebarProps) {
    const t = useTranslations("learningPaths");

    const getLevelText = (lvl: string) => {
        const uppercaseLvl = lvl.toUpperCase();
        switch (uppercaseLvl) {
            case "BEGINNER": return t("beginner");
            case "INTERMEDIATE": return t("intermediate");
            case "ADVANCED": return t("advanced");
            default: return lvl;
        }
    };

    return (
        <div className="flex flex-col h-full bg-card relative">
            <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />

            {/* Learning Path Header Card */}
            <div
                onClick={() => setActiveItem({ type: "path" })}
                className={cn(
                    "p-4 border-b border-border/30 transition-all duration-300 cursor-pointer hover:bg-muted/40 select-none group",
                    activeItem.type === "path"
                        ? "bg-primary/5 border-l-4 border-l-primary border-b-primary/10"
                        : "border-l-4 border-l-transparent"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-sm",
                        activeItem.type === "path"
                            ? "bg-primary text-primary-foreground border-primary/20 shadow-md shadow-primary/10"
                            : "bg-muted/80 text-muted-foreground border-border/40 group-hover:bg-muted group-hover:text-foreground"
                    )}>
                        <GraduationCap className="size-5.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors tracking-tight">
                            {pathName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted/65 px-1.5 py-0.5 rounded-md border border-border/30">
                                {getLevelText(level)}
                            </span>
                            <span className="text-muted-foreground/30 text-[9px]">•</span>
                            <span className={cn(
                                "text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border",
                                isPremium
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            )}>
                                {isPremium ? t("premium") : t("free")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tree Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-extrabold text-muted-foreground/80 uppercase tracking-widest">
                        {t("courseOutline")}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted border border-border/20 px-2.5 py-0.5 rounded-full font-bold">
                        {t("topicsCount", { count: topics.length })}
                    </span>
                </div>

                {topics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border-2 border-dashed border-border/40 gap-3.5 bg-muted/10 relative overflow-hidden">
                        <p className="text-xs text-muted-foreground leading-relaxed">{t("noTopicsCreated")}</p>
                        <Button size="xs" variant="outline" onClick={onAddTopic} className="h-8 text-[11px] font-bold rounded-lg border-border/40 hover:bg-muted/80">
                            <Plus className="size-3.5 mr-1" />
                            {t("addFirstTopic")}
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
            <div className="p-3 border-t border-border/30 bg-muted/20">
                <Button
                    onClick={onAddTopic}
                    className="w-full justify-center h-9.5 text-xs font-bold rounded-xl shadow-sm hover:shadow"
                    variant="outline"
                >
                    <PlusCircle className="size-4 mr-1.5 text-primary" />
                    {t("createNewTopic")}
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
    const t = useTranslations("learningPaths");
    const [isExpanded, setIsExpanded] = useState(true);
    const { data: lessonsData } = useLessonsByTopic(topic.id);
    const lessons: Lesson[] = lessonsData?.data ?? [];

    const isTopicActive = activeItem.type === "topic" && activeItem.id === topic.id;

    return (
        <div className="rounded-2xl border border-border/40 overflow-hidden bg-background/30 hover:border-border/70 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            {/* Topic Header Row */}
            <div
                className={cn(
                    "flex items-center gap-1.5 p-2.5 transition-all select-none border-b border-transparent",
                    isTopicActive
                        ? "bg-primary/5 text-primary border-primary/10"
                        : "hover:bg-muted/20"
                )}
            >
                {/* Collapse button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="shrink-0 size-6 rounded-lg hover:bg-muted/80 flex items-center justify-center transition-colors"
                >
                    <ChevronDown
                        className={cn(
                            "size-3.5 text-muted-foreground/80 transition-transform duration-300",
                            isExpanded && "rotate-180"
                        )}
                    />
                </button>

                {/* Topic Info click triggers editing */}
                <div
                    onClick={() => setActiveItem({ type: "topic", id: topic.id })}
                    className="flex-1 min-w-0 cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <span className="shrink-0 flex items-center justify-center size-5.5 rounded-lg bg-muted text-[10px] font-bold border border-border/20 shadow-inner">
                            {topic.displayOrder}
                        </span>
                        <span className="font-bold text-[11.5px] text-foreground truncate block tracking-tight group-hover:text-primary transition-colors">
                            {topic.name}
                        </span>
                    </div>
                </div>

                {/* Inline plus to add lesson */}
                <button
                    onClick={() => setActiveItem({ type: "create-lesson", topicId: topic.id })}
                    className="shrink-0 size-6.5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 flex items-center justify-center text-muted-foreground/80 transition-all duration-200"
                    title={t("addLesson")}
                >
                    <Plus className="size-4" />
                </button>
            </div>

            {/* Collapsible Lessons list */}
            {isExpanded && (
                <div className="border-t border-border/20 p-2 bg-muted/10 space-y-1">
                    {lessons.length === 0 ? (
                        <div
                            onClick={() => setActiveItem({ type: "create-lesson", topicId: topic.id })}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-500/5 hover:text-emerald-600 group transition-all duration-200"
                        >
                            <PlusCircle className="size-4 text-muted-foreground/75 group-hover:text-emerald-500 shrink-0" />
                            <span className="text-[11px] text-muted-foreground group-hover:text-emerald-600 font-bold">
                                {t("createFirstLesson")}
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
                                className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-muted/40 group transition-all duration-200 border border-transparent hover:border-border/30 bg-background/20"
                            >
                                <Plus className="size-3.5 text-muted-foreground shrink-0" />
                                <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider group-hover:text-foreground">
                                    {t("addLesson")}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
