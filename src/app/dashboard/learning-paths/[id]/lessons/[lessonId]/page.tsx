"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {
    ArrowLeftIcon,
    BookOpenIcon,
    CodeIcon,
    PencilIcon,
    PlusIcon,
    RocketIcon,
    SettingsIcon,
    Trash2Icon,
} from "lucide-react";
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
import {LessonForm} from "@/components/learning-path/lesson-form";
import {QuestionForm} from "@/components/learning-path/question-form";
import {TestCaseForm} from "@/components/learning-path/test-case-form";
import {EditorialForm} from "@/components/learning-path/editorial-form";
import {
    useLesson,
    useUpdateLesson,
    useDeleteLesson,
    useTogglePublishLesson,
} from "@/hooks/use-lessons";
import {
    useQuestionsByLesson,
    useCreateQuestion,
    useUpdateQuestion,
    useDeleteQuestion,
} from "@/hooks/use-quiz";
import {
    useTestCasesByLesson,
    useCreateTestCase,
    useUpdateTestCase,
    useDeleteTestCase,
} from "@/hooks/use-testcases";
import {
    useEditorialsByLesson,
    useCreateEditorial,
    useUpdateEditorial,
    useDeleteEditorial,
} from "@/hooks/use-editorials";
import {
    QuizQuestion,
    TestCase,
    Editorial,
    LessonType,
} from "@/types/learning-path";
import {CreateQuestion} from "@/types/learning-path/schema";
import {CreateTestCase} from "@/types/learning-path/schema";
import {CreateEditorial} from "@/types/learning-path/schema";

const LESSON_TYPE_ICONS: Record<LessonType, React.ReactNode> = {
    THEORY: <BookOpenIcon className="size-4" />,
    QUIZ: <BookOpenIcon className="size-4" />,
    CODING: <CodeIcon className="size-4" />,
};

export default function LessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const learningPathId = Number(params.id);
    const lessonId = Number(params.lessonId);

    const {data: lesson, isLoading: lessonLoading} = useLesson(lessonId);
    const updateLessonMutation = useUpdateLesson(lessonId);
    const deleteLessonMutation = useDeleteLesson();
    const togglePublishMutation = useTogglePublishLesson();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    if (lessonLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="h-20 w-full rounded-xl bg-muted animate-pulse" />
                <div className="h-96 rounded-xl bg-muted animate-pulse" />
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
                <p className="text-muted-foreground">Lesson not found.</p>
                <Button variant="outline" render={<Link href={`/dashboard/learning-paths/${learningPathId}`} />}>
                    <ArrowLeftIcon data-icon="inline-start" />
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
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon-sm" render={<Link href={`/dashboard/learning-paths/${learningPathId}`} />}>
                        <ArrowLeftIcon data-icon="inline-start" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                            {LESSON_TYPE_ICONS[lesson.type]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {lesson.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline">
                                    {lesson.type.charAt(0) + lesson.type.slice(1).toLowerCase()}
                                </Badge>
                                {lesson.difficulty && (
                                    <Badge variant="outline">{lesson.difficulty}</Badge>
                                )}
                                {lesson.isPublished ? (
                                    <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-400">
                                        Published
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Draft</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => togglePublishMutation.mutate(lessonId)}
                    >
                        <RocketIcon data-icon="inline-start" />
                        Toggle Publish
                    </Button>
                    <Button onClick={() => setIsEditOpen(true)}>
                        <PencilIcon data-icon="inline-start" />
                        Edit
                    </Button>
                </div>
            </div>

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
                        <BookOpenIcon data-icon="inline-start" />
                        Content
                    </TabsTrigger>

                    {lesson.type === "CODING" && (
                        <TabsTrigger value="test-cases">
                            <CodeIcon data-icon="inline-start" />
                            Test Cases
                        </TabsTrigger>
                    )}

                    {lesson.type === "CODING" && (
                        <TabsTrigger value="editorials">
                            <BookOpenIcon data-icon="inline-start" />
                            Editorials
                        </TabsTrigger>
                    )}

                    {lesson.type === "QUIZ" && (
                        <TabsTrigger value="questions">
                            <BookOpenIcon data-icon="inline-start" />
                            Questions
                        </TabsTrigger>
                    )}

                    <TabsTrigger value="settings">
                        <SettingsIcon data-icon="inline-start" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lesson Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lesson.content ? (
                                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                                    {lesson.content}
                                </p>
                            ) : (
                                <p className="text-muted-foreground">
                                    No content yet. Click Edit to add content.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Test Cases Tab (CODING only) */}
                {lesson.type === "CODING" && (
                    <TabsContent value="test-cases" className="mt-6">
                        <TestCasesTab lessonId={lessonId} />
                    </TabsContent>
                )}

                {/* Questions Tab (QUIZ only) */}
                {lesson.type === "QUIZ" && (
                    <TabsContent value="questions" className="mt-6">
                        <QuestionsTab lessonId={lessonId} />
                    </TabsContent>
                )}

                {/* Editorials Tab (CODING only) */}
                {lesson.type === "CODING" && (
                    <TabsContent value="editorials" className="mt-6">
                        <EditorialsTab lessonId={lessonId} />
                    </TabsContent>
                )}

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Danger Zone</CardTitle>
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
                                <Trash2Icon data-icon="inline-start" />
                                Delete
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Lesson Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Lesson</DialogTitle>
                        <DialogDescription>
                            Update the lesson content and settings.
                        </DialogDescription>
                    </DialogHeader>
                    <LessonForm
                        defaultValues={{
                            type: lesson.type,
                            title: lesson.title,
                            content: lesson.content,
                            difficulty: lesson.difficulty,
                            timeLimit: lesson.timeLimit,
                            memoryLimit: lesson.memoryLimit,
                            constraints: lesson.constraints,
                            starterCode: lesson.starterCode,
                            hints: lesson.hints,
                            examples: lesson.examples,
                            keyInsights: lesson.keyInsights,
                            passingScore: lesson.passingScore,
                            timeLimitMinutes: lesson.timeLimitMinutes,
                        }}
                        onSubmit={async (data) => {
                            await updateLessonMutation.mutateAsync(data as Parameters<typeof updateLessonMutation.mutateAsync>[0]);
                            setIsEditOpen(false);
                        }}
                        isPending={updateLessonMutation.isPending}
                        submitLabel="Save Changes"
                    />
                </DialogContent>
            </Dialog>

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

// ---------------------------------------------------------------------------
// Test Cases Tab
// ---------------------------------------------------------------------------
function TestCasesTab({lessonId}: {lessonId: number}) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<TestCase | null>(null);

    const {data: allTestCases = []} = useTestCasesByLesson(lessonId);
    const createMutation = useCreateTestCase(lessonId);
    const updateMutation = useUpdateTestCase(editing?.id ?? 0);
    const deleteMutation = useDeleteTestCase();

    const handleSubmit = async (formData: CreateTestCase) => {
        if (editing) {
            await updateMutation.mutateAsync(formData);
        } else {
            await createMutation.mutateAsync(formData);
        }
        setIsFormOpen(false);
        setEditing(null);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Test Cases</h3>
                <Button onClick={() => { setEditing(null); setIsFormOpen(true); }}>
                    <PlusIcon data-icon="inline-start" />
                    Add Test Case
                </Button>
            </div>

            {allTestCases.length === 0 ? (
                <div className="border rounded-xl p-12 text-center">
                    <p className="text-muted-foreground">No test cases yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {allTestCases.map((tc: TestCase, i: number) => (
                        <Card key={tc.id}>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                                        {tc.isHidden && <Badge variant="outline" className="text-xs">Hidden</Badge>}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon-xs" onClick={() => { setEditing(tc); setIsFormOpen(true); }}>
                                            <PencilIcon data-icon="inline-start" />
                                        </Button>
                                        <Button variant="ghost" size="icon-xs" onClick={() => { if (confirm("Delete this test case?")) { deleteMutation.mutate(tc.id); } }}>
                                            <Trash2Icon data-icon="inline-start" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Input: </span>
                                        <code className="text-xs bg-muted rounded px-1.5 py-0.5">{tc.stdin}</code>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Expected: </span>
                                        <code className="text-xs bg-muted rounded px-1.5 py-0.5">{tc.expectedStdout}</code>
                                    </div>
                                </div>
                                {tc.explanation && <p className="text-xs text-muted-foreground">{tc.explanation}</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setEditing(null); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Test Case" : "Add Test Case"}</DialogTitle>
                    </DialogHeader>
                    <TestCaseForm
                        defaultValues={editing ?? undefined}
                        onSubmit={handleSubmit}
                        isPending={editing ? updateMutation.isPending : createMutation.isPending}
                        submitLabel={editing ? "Save Changes" : "Add Test Case"}
                        onCancel={() => { setIsFormOpen(false); setEditing(null); }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Questions Tab
// ---------------------------------------------------------------------------
function QuestionsTab({lessonId}: {lessonId: number}) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<QuizQuestion | null>(null);

    const {data: allQuestions = []} = useQuestionsByLesson(lessonId);
    const createMutation = useCreateQuestion(lessonId);
    const updateMutation = useUpdateQuestion(editing?.id ?? 0);
    const deleteMutation = useDeleteQuestion();

    const handleSubmit = async (formData: CreateQuestion) => {
        if (editing) {
            await updateMutation.mutateAsync(formData);
        } else {
            await createMutation.mutateAsync(formData);
        }
        setIsFormOpen(false);
        setEditing(null);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions</h3>
                <Button onClick={() => { setEditing(null); setIsFormOpen(true); }}>
                    <PlusIcon data-icon="inline-start" />
                    Add Question
                </Button>
            </div>

            {allQuestions.length === 0 ? (
                <div className="border rounded-xl p-12 text-center">
                    <p className="text-muted-foreground">No questions yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {allQuestions.map((q: QuizQuestion, i: number) => (
                        <Card key={q.id}>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                                        <Badge variant="outline" className="text-xs">{q.type.replace("_", " ")}</Badge>
                                        <Badge variant="outline" className="text-xs">{q.points} pts</Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon-xs" onClick={() => { setEditing(q); setIsFormOpen(true); }}>
                                            <PencilIcon data-icon="inline-start" />
                                        </Button>
                                        <Button variant="ghost" size="icon-xs" onClick={() => { if (confirm("Delete this question?")) { deleteMutation.mutate(q.id); } }}>
                                            <Trash2Icon data-icon="inline-start" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="font-medium text-sm">{q.question}</p>
                                <div className="space-y-1">
                                    {q.choices.map((choice) => (
                                        <div
                                            key={choice.id}
                                            className={`text-sm px-3 py-1.5 rounded-lg ${
                                                choice.isCorrect
                                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                                                    : "bg-muted/50 text-muted-foreground"
                                            }`}
                                        >
                                            <span className="mr-2">{choice.isCorrect ? "Correct: " : "     "}</span>
                                            {choice.text}
                                        </div>
                                    ))}
                                </div>
                                {q.explanation && <p className="text-xs text-muted-foreground">Explanation: {q.explanation}</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setEditing(null); } }}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Question" : "Add Question"}</DialogTitle>
                    </DialogHeader>
                    <QuestionForm
                        defaultValues={editing ? {
                            question: editing.question,
                            type: editing.type,
                            points: editing.points,
                            explanation: editing.explanation,
                            choices: editing.choices.map((c) => ({
                                text: c.text,
                                isCorrect: c.isCorrect,
                                explanation: c.explanation,
                            })),
                        } : undefined}
                        onSubmit={handleSubmit}
                        isPending={editing ? updateMutation.isPending : createMutation.isPending}
                        submitLabel={editing ? "Save Changes" : "Add Question"}
                        onCancel={() => { setIsFormOpen(false); setEditing(null); }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Editorials Tab
// ---------------------------------------------------------------------------
function EditorialsTab({lessonId}: {lessonId: number}) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<Editorial | null>(null);

    const {data: allEditorials = []} = useEditorialsByLesson(lessonId);
    const createMutation = useCreateEditorial(lessonId);
    const updateMutation = useUpdateEditorial(editing?.id ?? 0);
    const deleteMutation = useDeleteEditorial();

    const handleSubmit = async (formData: CreateEditorial) => {
        if (editing) {
            await updateMutation.mutateAsync(formData);
        } else {
            await createMutation.mutateAsync(formData);
        }
        setIsFormOpen(false);
        setEditing(null);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Editorials</h3>
                <Button onClick={() => { setEditing(null); setIsFormOpen(true); }}>
                    <PlusIcon data-icon="inline-start" />
                    Add Editorial
                </Button>
            </div>

            {allEditorials.length === 0 ? (
                <div className="border rounded-xl p-12 text-center">
                    <p className="text-muted-foreground">No editorials yet. Add solution code in Java or Python.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {allEditorials.map((ed: Editorial) => (
                        <Card key={ed.id}>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">{ed.language}</Badge>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon-xs" onClick={() => { setEditing(ed); setIsFormOpen(true); }}>
                                            <PencilIcon data-icon="inline-start" />
                                        </Button>
                                        <Button variant="ghost" size="icon-xs" onClick={() => { if (confirm("Delete this editorial?")) { deleteMutation.mutate(ed.id); } }}>
                                            <Trash2Icon data-icon="inline-start" />
                                        </Button>
                                    </div>
                                </div>
                                <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto max-h-64">
                                    <code>{ed.sourceCode}</code>
                                </pre>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setEditing(null); } }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Editorial" : "Add Editorial"}</DialogTitle>
                    </DialogHeader>
                    <EditorialForm
                        defaultValues={editing ?? undefined}
                        onSubmit={handleSubmit}
                        isPending={editing ? updateMutation.isPending : createMutation.isPending}
                        submitLabel={editing ? "Save Changes" : "Add Editorial"}
                        onCancel={() => { setIsFormOpen(false); setEditing(null); }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
