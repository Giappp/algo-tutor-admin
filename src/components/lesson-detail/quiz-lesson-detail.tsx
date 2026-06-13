"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpenIcon, FileQuestion, SettingsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizSettingsForm } from "@/components/quiz/quiz-settings-form";
import { QuestionsTab } from "@/components/quiz/questions-tab";
import { DangerZoneCard } from "@/components/lesson-detail/danger-zone-card";
import { DeleteLessonDialog } from "@/components/lesson-detail/delete-lesson-dialog";
import { Lesson } from "@/types/learning-path";
import { useDeleteLesson, useUpdateLesson } from "@/hooks/use-lessons";
import type { QuizQuestionDraft } from "@/types/admin-ai-lesson";

interface QuizLessonDetailProps {
    lesson: Lesson;
    lessonId: number;
    learningPathId: number;
    updateMutation: ReturnType<typeof useUpdateLesson>;
    draftQuestions?: QuizQuestionDraft[];
}

export function QuizLessonDetail({ lesson, lessonId, learningPathId, updateMutation, draftQuestions = [] }: QuizLessonDetailProps) {
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
            <Tabs defaultValue="settings" className="w-full">
                <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b border-border/60">
                    <TabsTrigger value="settings" className="flex-none gap-1.5 rounded-none px-3 text-sm font-medium">
                        <BookOpenIcon className="size-3.5" />
                        {t("settingsTab")}
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="flex-none gap-1.5 rounded-none px-3 text-sm font-medium">
                        <FileQuestion className="size-3.5" />
                        {t("questionsTab")}
                        {lesson.questions && lesson.questions.length > 0 && (
                            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-border/40 bg-muted text-xs font-semibold tabular-nums text-foreground">
                                {lesson.questions.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="danger" className="flex-none gap-1.5 rounded-none px-3 text-sm font-medium">
                        <SettingsIcon className="size-3.5" />
                        {t("dangerZone")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="mt-4 focus-visible:outline-none">
                    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-[0_18px_50px_-44px_rgba(0,0,0,0.5)] sm:p-6">
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
                    </div>
                </TabsContent>

                <TabsContent value="questions" className="mt-4 focus-visible:outline-none">
                    <QuestionsTab lessonId={lessonId} draftQuestions={draftQuestions} />
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
