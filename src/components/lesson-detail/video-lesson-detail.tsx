"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {DangerZoneCard} from "@/components/lesson-detail/danger-zone-card";
import {DeleteLessonDialog} from "@/components/lesson-detail/delete-lesson-dialog";
import {VideoUploader} from "@/components/lesson-detail/video-uploader";
import {VideoLessonForm} from "@/components/learning-path/video-lesson-form";
import {useDeleteLesson, useUpdateLesson} from "@/hooks/use-lessons";
import type {Lesson} from "@/types/learning-path";

interface VideoLessonDetailProps {
    lesson: Lesson;
    lessonId: number;
    learningPathId: number;
    updateMutation: ReturnType<typeof useUpdateLesson>;
}

export function VideoLessonDetail({lesson, lessonId, learningPathId, updateMutation}: VideoLessonDetailProps) {
    const router = useRouter();
    const t = useTranslations("lessonForm.video");
    const tLearningPaths = useTranslations("learningPaths");
    const tCommon = useTranslations("common");
    const deleteMutation = useDeleteLesson();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    return (
        <div className="space-y-5">
            <VideoUploader lesson={lesson} lessonId={lessonId}/>
            <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-6">
                <VideoLessonForm
                    defaultValues={{
                        type: "VIDEO",
                        title: lesson.title,
                        difficulty: lesson.difficulty,
                        description: lesson.description ?? "",
                    }}
                    submitLabel={t("saveMetadata")}
                    isPending={updateMutation.isPending}
                    onSubmit={async (data) => {
                        await updateMutation.mutateAsync({id: lessonId, data});
                    }}
                />
            </div>
            <DangerZoneCard
                onDelete={() => setIsDeleteOpen(true)}
                title={tLearningPaths("settingsTab")}
                actionLabel={tLearningPaths("deleteLessonSub")}
                description={tLearningPaths("deleteLessonDescShort")}
                buttonText={tCommon("delete")}
            />
            <DeleteLessonDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                lessonTitle={lesson.title}
                isPending={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(lessonId, {
                    onSuccess: () => router.push(`/learning-paths/${learningPathId}`),
                })}
            />
        </div>
    );
}
