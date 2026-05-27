"use client";

import {useState} from "react";
import Link from "next/link";
import {ChevronDown, Lock, LockOpen, Pencil, Plus, Trash2} from "lucide-react";
import {cn} from "@/lib/utils";
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

export function TopicAccordionItem({topic, pathId}: TopicAccordionItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const updateTopicMutation = useUpdateTopic(topic.id);
    const deleteTopicMutation = useDeleteTopic();
    const deleteLessonMutation = useDeleteLesson();
    const togglePublishLessonMutation = useTogglePublishLesson();

    const {data: lessonsData} = useLessonsByTopic(topic.id);
    const lessons: Lesson[] = lessonsData?.data ?? [];

    const handleDeleteTopic = () => {
        if (confirm(`Delete topic "${topic.name}" and all its lessons?`)) {
            deleteTopicMutation.mutate(topic.id);
        }
    };

    const handleDeleteLesson = (lessonId: number) => {
        if (confirm("Delete this lesson?")) {
            deleteLessonMutation.mutate(lessonId);
        }
    };

    return (
        <div className="rounded-lg border bg-card overflow-hidden">
            {/* Topic Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
                {/* Expand toggle */}
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="shrink-0 flex items-center justify-center size-7 rounded-md hover:bg-muted transition-colors"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                    <ChevronDown
                        className={cn(
                            "size-4 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180"
                        )}
                    />
                </button>

                {/* Order badge */}
                <span className="shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    {topic.displayOrder}
                </span>

                {/* Topic info */}
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                            {topic.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                            · {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                    {topic.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {topic.description}
                        </p>
                    )}
                </button>

                {/* Lock status */}
                {topic.isLocked ? (
                    <span
                        className="shrink-0 inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400"
                        title="Locked — requires previous topic completion"
                    >
                        <Lock className="size-3"/>
                        Locked
                    </span>
                ) : (
                    <span
                        className="shrink-0 inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
                        title="Unlocked"
                    >
                        <LockOpen className="size-3"/>
                        Open
                    </span>
                )}

                {/* Topic actions */}
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setIsEditOpen(true)}
                        className="text-blue-600 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/40 dark:text-blue-400"
                        title="Edit topic"
                    >
                        <Pencil className="size-3.5"/>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={handleDeleteTopic}
                        disabled={deleteTopicMutation.isPending}
                        className="text-red-500 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-600 dark:text-red-400"
                        title="Delete topic"
                    >
                        <Trash2 className="size-3.5"/>
                    </Button>
                </div>
            </div>

            {/* Expanded: Lessons */}
            {isExpanded && (
                <div className="border-t px-4 py-3 space-y-2">
                    {lessons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 gap-3">
                            <p className="text-sm text-muted-foreground">No lessons in this topic</p>
                            <Button
                                size="sm"
                                nativeButton={false}
                                render={
                                    <Link href={`/dashboard/learning-paths/${pathId}/topics/${topic.id}/lessons/create`}/>
                                }
                            >
                                <Plus data-icon="inline-start" className="size-4"/>
                                Create Lesson
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-2">
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

                            {/* Add lesson button */}
                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    nativeButton={false}
                                    render={
                                        <Link href={`/dashboard/learning-paths/${pathId}/topics/${topic.id}/lessons/create`}/>
                                    }
                                    className="w-full"
                                >
                                    <Plus data-icon="inline-start" className="size-4"/>
                                    Add Lesson
                                </Button>
                            </div>
                        </>
                    )}
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
                            isLocked: topic.isLocked,
                        }}
                        onSubmit={async (data) => {
                            await updateTopicMutation.mutateAsync(
                                data as UpdateTopicRequest
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
