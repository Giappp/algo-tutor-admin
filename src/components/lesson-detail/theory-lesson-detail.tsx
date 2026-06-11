"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpenIcon, SettingsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TheoryContentForm } from "@/components/learning-path/theory-content-form";
import { DangerZoneCard } from "@/components/lesson-detail/danger-zone-card";
import { DeleteLessonDialog } from "@/components/lesson-detail/delete-lesson-dialog";
import { Lesson } from "@/types/learning-path";
import { useDeleteLesson, useUpdateLesson } from "@/hooks/use-lessons";

interface TheoryLessonDetailProps {
    lesson: Lesson;
    lessonId: number;
    learningPathId: number;
    updateMutation: ReturnType<typeof useUpdateLesson>;
}

export function TheoryLessonDetail({ lesson, lessonId, learningPathId, updateMutation }: TheoryLessonDetailProps) {
    const t = useTranslations("learningPaths");
    const tCommon = useTranslations("common");
    const router = useRouter();
    const deleteMutation = useDeleteLesson();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleDelete = () => {
        deleteMutation.mutate(lessonId, {
            onSuccess: () => router.push(`/learning-paths/${learningPathId}`),
        });
    };

    return (
        <div className="relative">
            <Tabs defaultValue="content" className="w-full">
                <TabsList variant="line" className="w-full justify-start border-b border-border/60">
                    <TabsTrigger value="content" className="flex-none gap-1.5 rounded-none px-3 text-sm font-medium">
                        <BookOpenIcon className="size-3.5" />
                        {t("contentTab")}
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex-none gap-1.5 rounded-none px-3 text-sm font-medium">
                        <SettingsIcon className="size-3.5" />
                        {t("settingsTab")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-4 focus-visible:outline-none">
                    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-[0_18px_50px_-44px_rgba(0,0,0,0.5)] sm:p-6">
                            <TheoryContentForm
                                defaultValues={{
                                    type: "THEORY",
                                    title: lesson.title,
                                    displayOrder: lesson.displayOrder,
                                    content: lesson.content,
                                    difficulty: lesson.difficulty,
                                }}
                                onSubmit={async (data) => {
                                    await updateMutation.mutateAsync({ data, id: lessonId });
                                }}
                                isPending={updateMutation.isPending}
                                enableAutosave
                            />
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-4 focus-visible:outline-none">
                    <DangerZoneCard
                        onDelete={() => setIsDeleteOpen(true)}
                        title={t("settingsTab")}
                        actionLabel={t("deleteLessonSub")}
                        description={t("deleteLessonDescShort")}
                        buttonText={tCommon("delete")}
                    />
                </TabsContent>
            </Tabs>

            <DeleteLessonDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                lessonTitle={lesson.title}
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </div>
    );
}
