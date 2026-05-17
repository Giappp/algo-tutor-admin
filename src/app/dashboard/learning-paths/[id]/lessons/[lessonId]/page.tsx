"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {ArrowLeftIcon, BookOpenIcon, CodeIcon, SettingsIcon, Trash2Icon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {LessonHeader} from "@/components/learning-path/lesson-header";
import {LessonPageSkeleton} from "@/components/learning-path/lesson-skeleton";
import {TestCasesTab} from "@/components/learning-path/test-cases-tab";
import {QuestionsTab} from "@/components/quiz/questions-tab";
import {EditorialsTab} from "@/components/learning-path/editorials-tab";
import {TheoryForm} from "@/components/learning-path/theory-form";
import {CodingLessonForm} from "@/components/learning-path/coding-lesson-form";
import {QuizForm} from "@/components/quiz/quiz-form";
import {useDeleteLesson, useLesson, useTogglePublishLesson, useUpdateLesson,} from "@/hooks/use-lessons";

export default function LessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const learningPathId = Number(params.id);
    const lessonId = Number(params.lessonId);

    const {data: lesson, isLoading: lessonLoading} = useLesson(lessonId);
    const updateLessonMutation = useUpdateLesson();
    const deleteLessonMutation = useDeleteLesson();
    const togglePublishMutation = useTogglePublishLesson();

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    if (lessonLoading) {
        return <LessonPageSkeleton/>;
    }

    if (!lesson) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
                <p className="text-muted-foreground">Lesson not found.</p>
                <Button variant="outline" render={<Link href={`/dashboard/learning-paths/${learningPathId}`}/>}>
                    <ArrowLeftIcon data-icon="inline-start"/>
                    Back
                </Button>
            </div>
        );
    }

    const handleDelete = () => {
        deleteLessonMutation.mutate(lessonId, {
            onSuccess: () =>
                router.push(`/dashboard/learning-paths/${learningPathId}`),
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Lesson Header */}
            <LessonHeader
                lesson={lesson}
                learningPathId={learningPathId}
                onTogglePublish={() => togglePublishMutation.mutate(lessonId)}
                isEditPending={togglePublishMutation.isPending}
            />

            {/* Tabs */}
            <Tabs
                defaultValue={
                    lesson.type === "CODING"
                        ? "test-cases"
                        : lesson.type === "QUIZ"
                            ? "questions"
                            : "content"
                }
            >
                <TabsList>
                    <TabsTrigger value="content">
                        <BookOpenIcon data-icon="inline-start"/>
                        Content
                    </TabsTrigger>

                    {lesson.type === "CODING" && (
                        <TabsTrigger value="test-cases">
                            <CodeIcon data-icon="inline-start"/>
                            Test Cases
                        </TabsTrigger>
                    )}

                    {lesson.type === "CODING" && (
                        <TabsTrigger value="editorials">
                            <BookOpenIcon data-icon="inline-start"/>
                            Editorials
                        </TabsTrigger>
                    )}

                    {lesson.type === "QUIZ" && (
                        <TabsTrigger value="questions">
                            <BookOpenIcon data-icon="inline-start"/>
                            Questions
                        </TabsTrigger>
                    )}

                    <TabsTrigger value="settings">
                        <SettingsIcon data-icon="inline-start"/>
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* Content Tab — Edit Form */}
                <TabsContent value="content" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
                            {lesson.type === "CODING" ? (
                                <CodingLessonForm
                                    defaultValues={{
                                        type: "CODING",
                                        title: lesson.title,
                                        displayOrder: lesson.displayOrder,
                                        statement: lesson.statement,
                                        difficulty: lesson.difficulty,
                                        baseTimeLimitMs: lesson.baseTimeLimitMs,
                                        baseMemoryLimitMb: lesson.baseMemoryLimitMb,
                                        constraints: lesson.constraints ?? [],
                                        hints: lesson.hints ?? [],
                                        examples: lesson.examples ?? [],
                                        testCases: lesson.testCases ?? [],
                                    }}
                                    onSubmit={async (data) => {
                                        await updateLessonMutation.mutateAsync({data: data, id: lessonId});
                                        router.refresh();
                                    }}
                                    isPending={updateLessonMutation.isPending}
                                    submitLabel="Save Changes"
                                />
                            ) : lesson.type === "THEORY" ? (
                                <TheoryForm
                                    defaultValues={{
                                        type: "THEORY",
                                        title: lesson.title,
                                        displayOrder: lesson.displayOrder,
                                        content: lesson.content,
                                        difficulty: lesson.difficulty,
                                    }}
                                    onSubmit={async (data) => {
                                        await updateLessonMutation.mutateAsync({data: data, id: lessonId});
                                        router.refresh();
                                    }}
                                    isPending={updateLessonMutation.isPending}
                                    submitLabel="Save Changes"
                                />
                            ) : (
                                <QuizForm
                                    defaultValues={{
                                        type: "QUIZ",
                                        title: lesson.title,
                                        displayOrder: lesson.displayOrder,
                                        difficulty: lesson.difficulty,
                                        passingScore: lesson.passingScore,
                                        timeLimitMinutes: lesson.timeLimitMinutes,
                                        questions: lesson.questions,
                                    }}
                                    onSubmit={async (data) => {
                                        await updateLessonMutation.mutateAsync({data: data, id: lessonId});
                                        router.refresh();
                                    }}
                                    isPending={updateLessonMutation.isPending}
                                    submitLabel="Save Changes"
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Test Cases Tab (CODING only) */}
                {lesson.type === "CODING" && (
                    <TabsContent value="test-cases" className="mt-6">
                        <TestCasesTab lessonId={lessonId}/>
                    </TabsContent>
                )}

                {/* Questions Tab (QUIZ only) */}
                {lesson.type === "QUIZ" && (
                    <TabsContent value="questions" className="mt-6">
                        <QuestionsTab lessonId={lessonId}/>
                    </TabsContent>
                )}

                {/* Editorials Tab (CODING only) */}
                {lesson.type === "CODING" && (
                    <TabsContent value="editorials" className="mt-6">
                        <EditorialsTab lessonId={lessonId}/>
                    </TabsContent>
                )}

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SettingsIcon className="size-5 text-muted-foreground"/>
                                Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Delete Lesson</p>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete this lesson. This action cannot be undone.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={() => setIsDeleteOpen(true)}
                            >
                                <Trash2Icon data-icon="inline-start"/>
                                Delete
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Lesson</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &ldquo;{lesson.title}&rdquo;? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteLessonMutation.isPending}
                        >
                            {deleteLessonMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
