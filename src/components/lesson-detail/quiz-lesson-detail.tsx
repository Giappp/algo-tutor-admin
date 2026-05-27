"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {BookOpenIcon, FileQuestion, SettingsIcon} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {QuizSettingsForm} from "@/components/quiz/quiz-settings-form";
import {QuestionsTab} from "@/components/quiz/questions-tab";
import {DangerZoneCard} from "@/components/lesson-detail/danger-zone-card";
import {DeleteLessonDialog} from "@/components/lesson-detail/delete-lesson-dialog";
import {Lesson} from "@/types/learning-path";
import {useDeleteLesson, useUpdateLesson} from "@/hooks/use-lessons";

interface QuizLessonDetailProps {
    lesson: Lesson;
    lessonId: number;
    learningPathId: number;
    updateMutation: ReturnType<typeof useUpdateLesson>;
}

export function QuizLessonDetail({lesson, lessonId, learningPathId, updateMutation}: QuizLessonDetailProps) {
    const router = useRouter();
    const deleteMutation = useDeleteLesson();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleDelete = () => {
        deleteMutation.mutate(lessonId, {
            onSuccess: () => router.push(`/dashboard/learning-paths/${learningPathId}`),
        });
    };

    return (
        <>
            <Tabs defaultValue="settings">
                <TabsList>
                    <TabsTrigger value="settings">
                        <BookOpenIcon data-icon="inline-start"/>
                        Settings
                    </TabsTrigger>
                    <TabsTrigger value="questions">
                        <FileQuestion data-icon="inline-start"/>
                        Questions
                        {lesson.questions && lesson.questions.length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center size-6 rounded-full bg-muted text-sm font-bold text-foreground">
                                {lesson.questions.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="danger">
                        <SettingsIcon data-icon="inline-start"/>
                        Danger Zone
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
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
                                    await updateMutation.mutateAsync({data, id: lessonId});
                                }}
                                isPending={updateMutation.isPending}
                                enableAutosave
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="questions" className="mt-6">
                    <QuestionsTab lessonId={lessonId}/>
                </TabsContent>

                <TabsContent value="danger" className="mt-6">
                    <DangerZoneCard onDelete={() => setIsDeleteOpen(true)}/>
                </TabsContent>
            </Tabs>

            <DeleteLessonDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                lessonTitle={lesson.title}
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    );
}
