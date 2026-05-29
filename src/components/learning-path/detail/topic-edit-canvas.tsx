"use client";

import { useTopic, useUpdateTopic, useDeleteTopic } from "@/hooks/use-topics";
import { TopicForm } from "@/components/learning-path/topic-form";
import { DangerZoneCard } from "@/components/lesson-detail/danger-zone-card";
import { DeleteLessonDialog } from "@/components/lesson-detail/delete-lesson-dialog";
import { useState } from "react";
import { AlertCircle, ArrowLeft, BookOpen, Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UpdateTopicRequest } from "@/types/learning-path";

interface TopicEditCanvasProps {
    topicId: number;
    learningPathId: number;
    onReset: () => void;
}

export function TopicEditCanvas({
    topicId,
    learningPathId,
    onReset,
}: TopicEditCanvasProps) {
    const { data: topicData, isLoading, error } = useTopic(topicId);
    const updateMutation = useUpdateTopic(topicId, learningPathId);
    const deleteMutation = useDeleteTopic(learningPathId);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-48 w-full rounded-xl" />
            </div>
        );
    }

    if (error || !topicData) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <AlertCircle className="size-6" />
                </div>
                <div>
                    <h3 className="font-bold text-base">Topic Not Found</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        The selected topic could not be loaded or has been deleted.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={onReset}>
                    <ArrowLeft className="size-3.5 mr-1.5" />
                    Back to Learning Path
                </Button>
            </div>
        );
    }

    const topic = topicData;

    const handleDelete = () => {
        deleteMutation.mutate(topicId, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                onReset();
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Topic Dashboard Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 border border-indigo-500/10">
                <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm border border-border/50 flex items-center justify-center text-indigo-500">
                            <BookOpen className="size-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg text-foreground truncate block">
                                    {topic.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    · Order {topic.displayOrder}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                                {topic.isLocked ? (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                                        <Lock className="size-3" />
                                        Locked by Default
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                                        <LockOpen className="size-3" />
                                        Open by Default
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form and Danger Zone tabbed or split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Topic Details</h3>
                    <TopicForm
                        defaultValues={{
                            name: topic.name,
                            description: topic.description,
                            isLocked: topic.isLocked,
                        }}
                        onSubmit={async (data) => {
                            await updateMutation.mutateAsync(data as UpdateTopicRequest);
                        }}
                        isPending={updateMutation.isPending}
                        submitLabel="Save Topic"
                    />
                </div>

                <div className="xl:col-span-1 space-y-6">
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Settings</h3>
                        <DangerZoneCard onDelete={() => setIsDeleteOpen(true)} />
                    </div>
                </div>
            </div>

            {/* Delete dialog */}
            <DeleteLessonDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                lessonTitle={topic.name}
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </div>
    );
}
