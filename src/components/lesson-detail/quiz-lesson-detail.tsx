"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpenIcon, FileQuestion, SettingsIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizSettingsForm } from "@/components/quiz/quiz-settings-form";
import { QuestionsTab } from "@/components/quiz/questions-tab";
import { DangerZoneCard } from "@/components/lesson-detail/danger-zone-card";
import { DeleteLessonDialog } from "@/components/lesson-detail/delete-lesson-dialog";
import { Lesson } from "@/types/learning-path";
import { useDeleteLesson, useUpdateLesson } from "@/hooks/use-lessons";

interface QuizLessonDetailProps {
    lesson: Lesson;
    lessonId: number;
    learningPathId: number;
    updateMutation: ReturnType<typeof useUpdateLesson>;
}

export function QuizLessonDetail({ lesson, lessonId, learningPathId, updateMutation }: QuizLessonDetailProps) {
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

            <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[420px] bg-muted/60 p-1 rounded-xl">
                    <TabsTrigger value="settings" className="rounded-lg text-xs font-bold transition-all gap-1.5">
                        <BookOpenIcon className="size-3.5" />
                        {t("settingsTab")}
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="rounded-lg text-xs font-bold transition-all gap-1.5">
                        <FileQuestion className="size-3.5" />
                        {t("questionsTab")}
                        {lesson.questions && lesson.questions.length > 0 && (
                            <span className="inline-flex items-center justify-center size-5 rounded-md bg-muted text-[10px] font-extrabold border border-border/40 text-foreground shrink-0 shadow-inner">
                                {lesson.questions.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="danger" className="rounded-lg text-xs font-bold transition-all gap-1.5">
                        <SettingsIcon className="size-3.5" />
                        {t("dangerZone")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="mt-4 focus-visible:outline-none">
                    <Card className="border-border/40 shadow-sm overflow-hidden relative">
                        <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />
                        <CardContent className="p-5">
                            <QuizSettingsForm
                                defaultValues={{
                                    type: "QUIZ",
                                    title: lesson.title,
                                    displayOrder: lesson.displayOrder,
                                    difficulty: lesson.difficulty,
                                    passingScore: lesson.passingScore,
                                    timeLimitMinutes: lesson.timeLimitMinutes,
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

                <TabsContent value="questions" className="mt-4 focus-visible:outline-none">
                    <QuestionsTab lessonId={lessonId} />
                </TabsContent>

                <TabsContent value="danger" className="mt-4 focus-visible:outline-none">
                    <DangerZoneCard
                        onDelete={() => setIsDeleteOpen(true)}
                        title={t("dangerZone")}
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
