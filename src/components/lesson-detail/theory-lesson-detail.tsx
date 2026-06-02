"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpenIcon, SettingsIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
            <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />

            <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[280px] bg-muted/60 p-1 rounded-xl">
                    <TabsTrigger value="content" className="rounded-lg text-xs font-bold transition-all gap-1.5">
                        <BookOpenIcon className="size-3.5" />
                        {t("contentTab")}
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-lg text-xs font-bold transition-all gap-1.5">
                        <SettingsIcon className="size-3.5" />
                        {t("settingsTab")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-4 focus-visible:outline-none">
                    <Card className="border-border/40 shadow-sm overflow-hidden relative">
                        <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />
                        <CardContent className="p-5">
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
                        </CardContent>
                    </Card>
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
