"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {ArrowLeftIcon, BookOpenIcon, CheckIcon, CodeIcon, SettingsIcon, Trash2Icon, XIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
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
import {QuestionsTab} from "@/components/learning-path/questions-tab";
import {EditorialsTab} from "@/components/learning-path/editorials-tab";
import {RichTextDisplay} from "@/components/ui/rich-text-editor";
import {LessonForm} from "@/components/learning-path/lesson-form";
import {TheoryForm} from "@/components/learning-path/theory-form";
import {CodingLessonForm} from "@/components/learning-path/coding-lesson-form";
import {useDeleteLesson, useLesson, useTogglePublishLesson, useUpdateLesson,} from "@/hooks/use-lessons";

export default function LessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const learningPathId = Number(params.id);
    const lessonId = Number(params.lessonId);

    const {data: lesson, isLoading: lessonLoading} = useLesson(lessonId);
    const updateLessonMutation = useUpdateLesson(lessonId);
    const deleteLessonMutation = useDeleteLesson();
    const togglePublishMutation = useTogglePublishLesson();

    const [isEditing, setIsEditing] = useState(false);
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

    const handleSaveSuccess = () => {
        setIsEditing(false);
        router.refresh();
    };

    // ============================================================
    // EDIT MODE - Full-page form
    // ============================================================
    if (isEditing) {
        return (
            <div className="flex flex-col gap-6">
                {/* Edit Mode Header */}
                <div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent p-5">
                    <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.1),transparent_60%)]"/>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setIsEditing(false)}
                            >
                                <XIcon data-icon="inline-start"/>
                            </Button>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline"
                                       className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    Editing
                                </Badge>
                                <span className="text-sm text-muted-foreground">{lesson.title}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                form="lesson-edit-form"
                                type="submit"
                                disabled={updateLessonMutation.isPending}
                            >
                                {updateLessonMutation.isPending ? (
                                    <span className="flex items-center gap-1.5">
                                        <span
                                            className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"/>
                                        Saving...
                                    </span>
                                ) : (
                                    <>
                                        <CheckIcon data-icon="inline-start"/>
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="flex flex-col gap-4">
                    {lesson.type === "CODING" ? (
                        <CodingLessonForm
                            editMode
                            defaultValues={{
                                type: "CODING",
                                title: lesson.title,
                                statement: lesson.statement,
                                difficulty: lesson.difficulty,
                                baseTimeLimitMs: lesson.baseTimeLimitMs,
                                baseMemoryLimitMb: lesson.baseMemoryLimitMb,
                                constraints: lesson.constraints,
                                starterCode: lesson.starterCode,
                                hints: lesson.hints,
                                examples: lesson.examples,
                            }}
                            onSubmit={async (data) => {
                                await updateLessonMutation.mutateAsync(data as Parameters<typeof updateLessonMutation.mutateAsync>[0]);
                                handleSaveSuccess();
                            }}
                            isPending={updateLessonMutation.isPending}
                            submitLabel="Save Changes"
                        />
                    ) : lesson.type === "THEORY" ? (
                        <TheoryForm
                            editMode
                            defaultValues={{
                                type: "THEORY",
                                title: lesson.title,
                                content: lesson.content,
                                difficulty: lesson.difficulty,
                            }}
                            onSubmit={async (data) => {
                                await updateLessonMutation.mutateAsync(data as Parameters<typeof updateLessonMutation.mutateAsync>[0]);
                                handleSaveSuccess();
                            }}
                            isPending={updateLessonMutation.isPending}
                            submitLabel="Save Changes"
                        />
                    ) : (
                        <LessonForm
                            editMode
                            defaultValues={{
                                type: "QUIZ",
                                title: lesson.title,
                                content: lesson.content,
                                difficulty: lesson.difficulty,
                                passingScore: lesson.passingScore,
                                timeLimitMinutes: lesson.timeLimitMinutes,
                            }}
                            onSubmit={async (data) => {
                                await updateLessonMutation.mutateAsync(data as Parameters<typeof updateLessonMutation.mutateAsync>[0]);
                                handleSaveSuccess();
                            }}
                            isPending={updateLessonMutation.isPending}
                            submitLabel="Save Changes"
                        />
                    )}
                </div>
            </div>
        );
    }

    // ============================================================
    // VIEW MODE - Tabbed interface
    // ============================================================
    return (
        <div className="flex flex-col gap-6">
            {/* Lesson Header */}
            <LessonHeader
                lesson={lesson}
                learningPathId={learningPathId}
                onEdit={() => setIsEditing(true)}
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

                {/* Content Tab */}
                <TabsContent value="content" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpenIcon className="size-5 text-muted-foreground"/>
                                Lesson Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RichTextDisplay content={lesson.content ?? ""}/>
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
