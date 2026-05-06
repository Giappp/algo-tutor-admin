"use client";

import {useState} from "react";
import Link from "next/link";
import {ChevronDown, Lock, LockOpen, Pencil, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {TopicForm} from "@/components/learning-path/topic-form";
import {LessonListItem} from "./lesson-list-item";
import {useDeleteLesson, useLessonsByTopic, useTogglePublishLesson} from "@/hooks/use-lessons";
import {useDeleteTopic, useUpdateTopic} from "@/hooks/use-topics";
import {Lesson, Topic, UpdateTopicRequest} from "@/types/learning-path";

interface TopicAccordionItemProps {
    topic: Topic;
    pathId: number;
}

const TOPIC_COLORS = [
    {
        bg: "bg-chart-1/10",
        text: "text-chart-1",
        border: "border-chart-1/20",
        strip: "from-chart-1",
    },
    {
        bg: "bg-chart-3/10",
        text: "text-chart-3",
        border: "border-chart-3/20",
        strip: "from-chart-3",
    },
];

function getTopicColor(orderIndex: number) {
    return TOPIC_COLORS[orderIndex % TOPIC_COLORS.length];
}

export function TopicAccordionItem({topic, pathId}: TopicAccordionItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const updateTopicMutation = useUpdateTopic(topic.id);
    const deleteTopicMutation = useDeleteTopic();
    const deleteLessonMutation = useDeleteLesson();
    const togglePublishLessonMutation = useTogglePublishLesson();

    const {data: lessonsData} = useLessonsByTopic(topic.id);
    const lessons: Lesson[] = lessonsData?.data ?? [];

    const topicColor = getTopicColor(topic.orderIndex);

    const handleDeleteTopic = () => {
        if (confirm("Delete this topic?")) {
            deleteTopicMutation.mutate(topic.id);
        }
    };

    const handleDeleteLesson = (lessonId: number) => {
        if (confirm("Delete this lesson?")) {
            deleteLessonMutation.mutate(lessonId);
        }
    };

    return (
        <div
            className={`rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:border-chart-1/20 ${topic.isLocked ? "opacity-60" : ""}`}
        >
            {/* Topic Header */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/40 transition-colors text-left group"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Order index badge */}
                    <div
                        className={`shrink-0 flex items-center justify-center size-8 rounded-lg ${topicColor.bg} ${topicColor.border} border group-hover:scale-105 transition-transform duration-200`}>
                        <span className={`text-xs font-black ${topicColor.text}`}>
                            #{topic.orderIndex}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="font-semibold text-foreground truncate text-sm">
                            {topic.name}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground font-medium">
                                {topic.lessonCount} lesson{topic.lessonCount !== 1 ? "s" : ""}
                            </span>
                            {topic.scopeTags && (
                                <span className="text-xs text-muted-foreground truncate">
                                    {topic.scopeTags}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                    {topic.isLocked ? (
                        <div className="flex items-center justify-center size-7 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                            <Lock className="size-3.5"/>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center size-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <LockOpen className="size-3.5"/>
                        </div>
                    )}
                    <div
                        className={`flex items-center justify-center size-7 rounded-md transition-all duration-200 ${isExpanded ? "bg-chart-1/10 text-chart-1 rotate-180" : "bg-muted text-muted-foreground"}`}>
                        <ChevronDown className="size-4"/>
                    </div>
                </div>
            </button>

            {/* Expanded: Lessons */}
            {isExpanded && (
                <div className="border-t border-border p-4 space-y-3 animate-accordion-expand">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Lessons
                            </h4>
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-medium">
                                {lessons.length}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant={"outline"}
                            nativeButton={false}
                            render={
                                <Link
                                    href={`/dashboard/learning-paths/${pathId}/topics/${topic.id}/lessons/create`}
                                />
                            }
                            className="gap-1.5 text-xs h-7 bg-chart-1/10 hover:bg-chart-1/15 text-chart-1 border-chart-1/20 hover:border-chart-1/30 transition-all shadow-sm"
                        >
                            <Plus className="size-3"/>
                            Add Lesson
                        </Button>
                    </div>

                    {lessons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 gap-3">
                            <div className="flex items-center justify-center size-10 rounded-xl bg-muted border border-border">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="1.75" className="text-muted-foreground">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">No lessons yet.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                nativeButton={false}
                                render={
                                    <Link
                                        href={`/dashboard/learning-paths/${pathId}/topics/${topic.id}/lessons/create`}
                                    />
                                }
                                className="text-xs h-7 text-chart-1 border-chart-1/30 hover:bg-chart-1/10"
                            >
                                <Plus className="size-3 mr-1"/>
                                Create First Lesson
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 stagger-children">
                            {lessons.map((lesson: Lesson) => (
                                <LessonListItem
                                    key={lesson.id}
                                    lesson={lesson}
                                    pathId={pathId}
                                    onTogglePublish={(id) => togglePublishLessonMutation.mutate(id)}
                                    onDelete={handleDeleteLesson}
                                />
                            ))}
                        </div>
                    )}

                    {/* Topic action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60 mt-2">
                        <Button
                            size="sm"
                            variant={"outline"}
                            onClick={() => setIsEditOpen(true)}
                            className="gap-1.5 text-xs h-8 bg-chart-1/10 hover:bg-chart-1/15 text-chart-1 border-chart-1/20 hover:border-chart-1/30 transition-all shadow-sm"
                        >
                            <Pencil className="size-3"/>
                            Edit Topic
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleDeleteTopic}
                            className="gap-1.5 text-xs h-8 bg-destructive/10 hover:bg-destructive/15 text-destructive border border-destructive/20 hover:border-destructive/30 transition-colors"
                        >
                            <Trash2 className="size-3"/>
                            Delete
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Topic Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Topic</DialogTitle>
                        <DialogDescription>
                            Update the details for &ldquo;{topic.name}&rdquo;.
                        </DialogDescription>
                    </DialogHeader>
                    <TopicForm
                        defaultValues={{
                            name: topic.name,
                            description: topic.description,
                            scopeTags: topic.scopeTags,
                            isLocked: topic.isLocked,
                        }}
                        onSubmit={async (data) => {
                            await updateTopicMutation.mutateAsync(
                                data as unknown as UpdateTopicRequest
                            );
                            setIsEditOpen(false);
                        }}
                        isPending={updateTopicMutation.isPending}
                        submitLabel="Save Changes"
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
