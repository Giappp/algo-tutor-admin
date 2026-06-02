"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTopic, useUpdateTopic, useDeleteTopic } from "@/hooks/use-topics";
import { TopicForm } from "@/components/learning-path/topic-form";
import { DangerZoneCard } from "@/components/lesson-detail/danger-zone-card";
import { DeleteLessonDialog } from "@/components/lesson-detail/delete-lesson-dialog";
import { AlertCircle, ArrowLeft, BookOpen, Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
    const t = useTranslations("learningPaths");
    const tCommon = useTranslations("common");
    const { data: topicData, isLoading, error } = useTopic(topicId);
    const updateMutation = useUpdateTopic(topicId, learningPathId);
    const deleteMutation = useDeleteTopic(learningPathId);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/3 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
                <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
        );
    }

    if (error || !topicData) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />
                <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-inner">
                    <AlertCircle className="size-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">{t("topicNotFound")}</h3>
                    <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                        {t("topicNotFoundDesc")}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={onReset} className="rounded-xl font-bold text-xs mt-2">
                    <ArrowLeft className="size-3.5 mr-1.5" />
                    {t("backToPath")}
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
        <div className="space-y-6 relative">
            <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />

            {/* Topic Dashboard Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent p-6 border border-indigo-500/10 shadow-sm">
                <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-background/90 backdrop-blur-sm shadow-sm border border-border/50 flex items-center justify-center text-indigo-500 shrink-0">
                            <BookOpen className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                                <span className="font-bold text-base text-foreground truncate block tracking-tight">
                                    {topic.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-extrabold bg-muted border border-border/20 px-2 py-0.5 rounded-full shrink-0 w-fit">
                                    {t("orderIndex", { order: topic.displayOrder })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                {topic.isLocked ? (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                        <Lock className="size-2.5" />
                                        {t("lockedByDefault")}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                        <LockOpen className="size-2.5" />
                                        {t("openByDefault")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form and Danger Zone tabbed or split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 rounded-2xl border border-border/40 bg-card p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{t("topicDetails")}</h3>
                    <TopicForm
                        defaultValues={{
                            name: topic.name,
                            description: topic.description,
                        }}
                        onSubmit={async (data) => {
                            await updateMutation.mutateAsync(data);
                        }}
                        isPending={updateMutation.isPending}
                        submitLabel={t("saveTopic")}
                    />
                </div>

                <div className="xl:col-span-1 space-y-6">
                    <DangerZoneCard
                        onDelete={() => setIsDeleteOpen(true)}
                        title={t("settings")}
                        actionLabel={t("deleteTopicSub")}
                        description={t("deleteTopicDescShort")}
                        buttonText={tCommon("delete")}
                    />
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
