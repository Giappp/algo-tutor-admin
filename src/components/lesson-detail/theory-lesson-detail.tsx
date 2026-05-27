"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {BookOpenIcon, SettingsIcon} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {TheoryContentForm} from "@/components/learning-path/theory-content-form";
import {DangerZoneCard} from "@/components/lesson-detail/danger-zone-card";
import {DeleteLessonDialog} from "@/components/lesson-detail/delete-lesson-dialog";
import {Lesson} from "@/types/learning-path";
import {useDeleteLesson, useUpdateLesson} from "@/hooks/use-lessons";

interface TheoryLessonDetailProps {
    lesson: Lesson;
    lessonId: number;
    learningPathId: number;
    updateMutation: ReturnType<typeof useUpdateLesson>;
}

export function TheoryLessonDetail({lesson, lessonId, learningPathId, updateMutation}: TheoryLessonDetailProps) {
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
            <Tabs defaultValue="content">
                <TabsList>
                    <TabsTrigger value="content">
                        <BookOpenIcon data-icon="inline-start"/>
                        Content
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <SettingsIcon data-icon="inline-start"/>
                        Danger Zone
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
                            <TheoryContentForm
                                defaultValues={{
                                    type: "THEORY",
                                    title: lesson.title,
                                    displayOrder: lesson.displayOrder,
                                    content: lesson.content,
                                    difficulty: lesson.difficulty,
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

                <TabsContent value="settings" className="mt-6">
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
