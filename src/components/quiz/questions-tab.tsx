"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {
    Check,
    CircleHelp,
    FileQuestion,
    Lightbulb,
    Loader2,
    Pencil,
    Plus,
    Sparkles,
    Trash2,
    WandSparkles,
} from "lucide-react";
import {toast} from "sonner";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {AIQuestionGeneratorDialog} from "@/components/quiz/ai-question-generator-dialog";
import QuestionDialog from "@/components/quiz/question-dialog";
import {useCreateQuestion, useDeleteQuestion, useQuestionsByLesson, useUpdateQuestion} from "@/hooks/use-quiz";
import {toQuestionRequest} from "@/lib/admin-ai-lesson";
import {cn} from "@/lib/utils";
import type {QuizQuestionDraft} from "@/types/admin-ai-lesson";
import {QuizQuestion} from "@/types/learning-path";
import {QuestionRequestDTO} from "@/types/learning-path/schema";

interface QuestionsTabProps {
    lessonId: number;
    draftQuestions?: QuizQuestionDraft[];
}

export function QuestionsTab({lessonId, draftQuestions = []}: QuestionsTabProps) {
    const t = useTranslations("lessonForm.questions");
    const tAi = useTranslations("lessonForm.ai");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<QuizQuestion | null>(null);
    const [deleting, setDeleting] = useState<QuizQuestion | null>(null);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [isAddingAi, setIsAddingAi] = useState(false);
    const [draftAdded, setDraftAdded] = useState(false);

    const {data: questions = [], isLoading} = useQuestionsByLesson(lessonId);
    const createMutation = useCreateQuestion(lessonId);
    const aiCreateMutation = useCreateQuestion(lessonId, {silent: true});
    const updateMutation = useUpdateQuestion(editing?.id ?? 0);
    const deleteMutation = useDeleteQuestion();
    const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);

    const openCreateDialog = () => {
        setEditing(null);
        setIsFormOpen(true);
    };

    const handleSubmit = async (formData: QuestionRequestDTO) => {
        if (editing) {
            await updateMutation.mutateAsync(formData);
        } else {
            await createMutation.mutateAsync(formData);
        }
        setIsFormOpen(false);
        setEditing(null);
    };

    const handleAiQuestionsAdd = async (newQuestions: QuestionRequestDTO[], markDraftAdded = false) => {
        setIsAddingAi(true);
        try {
            for (const question of newQuestions) {
                await aiCreateMutation.mutateAsync(question);
            }
            if (markDraftAdded) setDraftAdded(true);
            toast.success(t("toast.aiAdded", {count: newQuestions.length}));
        } catch {
            toast.error(t("toast.aiAddFailed"));
        } finally {
            setIsAddingAi(false);
            setIsAiOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        await deleteMutation.mutateAsync(deleting.id);
        setDeleting(null);
    };

    return (
        <section className="flex flex-col gap-5">
            {draftQuestions.length > 0 && !draftAdded && (
                <div className="flex flex-col gap-4 rounded-2xl bg-primary/6 p-4 ring-1 ring-primary/20 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <WandSparkles />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-semibold">{tAi("questionsReady")}</p>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {tAi("questionsReadyDescription", {count: draftQuestions.length})}
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        disabled={isAddingAi}
                        onClick={() => handleAiQuestionsAdd(draftQuestions.map(toQuestionRequest), true)}
                    >
                        {isAddingAi && <Loader2 data-icon="inline-start" className="animate-spin" />}
                        {isAddingAi ? tAi("addingQuestions") : tAi("addQuestions", {count: draftQuestions.length})}
                    </Button>
                </div>
            )}

            <div className="flex flex-col gap-4 rounded-2xl bg-card/70 p-4 ring-1 ring-border/70 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileQuestion />
                        </div>
                        <div>
                            <h2 className="font-heading text-lg font-semibold tracking-tight">{t("title")}</h2>
                            <p className="mt-0.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                                {t("description")}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <Button type="button" variant="ai" onClick={() => setIsAiOpen(true)}>
                            <Sparkles data-icon="inline-start" />
                            {t("generateWithAi")}
                        </Button>
                        <Button type="button" onClick={openCreateDialog}>
                            <Plus data-icon="inline-start" />
                            {t("addQuestion")}
                        </Button>
                    </div>
                </div>

                {!isLoading && questions.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-4 sm:flex sm:items-center">
                        <Metric label={t("summary.questionLabel")} value={questions.length} />
                        <Metric label={t("summary.pointLabel")} value={totalPoints} />
                    </div>
                )}
            </div>

            {isLoading && <QuestionsSkeleton />}

            {!isLoading && questions.length === 0 && (
                <Card className="border-dashed bg-card/50 py-12 shadow-none ring-border/70">
                    <CardContent className="flex flex-col items-center text-center">
                        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <CircleHelp />
                        </div>
                        <h3 className="font-heading text-lg font-semibold">{t("empty.title")}</h3>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                            {t("empty.description")}
                        </p>
                        <Button className="mt-5" onClick={openCreateDialog}>
                            <Plus data-icon="inline-start" />
                            {t("empty.action")}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!isLoading && questions.length > 0 && (
                <div className="flex flex-col gap-3">
                    {questions.map((question: QuizQuestion, index: number) => (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            index={index}
                            onEdit={() => {
                                setEditing(question);
                                setIsFormOpen(true);
                            }}
                            onDelete={() => setDeleting(question)}
                        />
                    ))}
                </div>
            )}

            <QuestionDialog
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditing(null);
                }}
                question={editing}
                onSubmit={handleSubmit}
                isPending={editing ? updateMutation.isPending : createMutation.isPending}
            />

            <AIQuestionGeneratorDialog
                open={isAiOpen}
                lessonId={lessonId}
                onOpenChange={setIsAiOpen}
                onAddQuestions={handleAiQuestionsAdd}
                isPending={isAddingAi}
            />

            <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive">
                            <Trash2 />
                        </AlertDialogMedia>
                        <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("delete.description")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>{t("delete.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={handleDelete}
                        >
                            {deleteMutation.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
                            {deleteMutation.isPending ? t("delete.deleting") : t("delete.confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}

function Metric({label, value}: {label: string; value: number}) {
    return (
        <div className="flex items-baseline gap-2 rounded-xl bg-muted/50 px-3 py-2 sm:bg-transparent sm:px-0 sm:py-0 sm:after:ml-2 sm:after:text-border sm:after:content-['/'] last:sm:after:hidden">
            <span className="font-mono text-base font-semibold tabular-nums text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

function QuestionsSkeleton() {
    return (
        <div className="flex flex-col gap-3" aria-hidden="true">
            {[1, 2, 3].map((item) => (
                <Card key={item} size="sm">
                    <CardHeader>
                        <Skeleton className="h-5 w-56" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="grid gap-2 sm:grid-cols-2">
                        <Skeleton className="h-11" />
                        <Skeleton className="h-11" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

interface QuestionCardProps {
    question: QuizQuestion;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}

function QuestionCard({question, index, onEdit, onDelete}: QuestionCardProps) {
    const t = useTranslations("lessonForm.questions");
    const correctCount = question.choices.filter((choice) => choice.isCorrect).length;

    return (
        <Card size="sm" className="transition-all duration-200 hover:-translate-y-0.5 hover:ring-primary/25">
            <CardHeader className="grid-cols-[auto_1fr_auto] items-start gap-x-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold tabular-nums text-primary">
                    {index + 1}
                </div>
                <div className="min-w-0">
                    <CardTitle className="text-pretty text-sm font-semibold leading-relaxed sm:text-base">
                        {question.question}
                    </CardTitle>
                    <CardDescription className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary">{t(`types.${question.type}`)}</Badge>
                        <Badge variant="outline">{t("card.points", {count: question.points})}</Badge>
                        <span className="text-xs">{t("card.correctCount", {correct: correctCount, total: question.choices.length})}</span>
                    </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={t("card.edit")}>
                        <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label={t("card.delete")} className="text-destructive">
                        <Trash2 />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="grid gap-2 sm:grid-cols-2">
                {question.choices.map((choice, choiceIndex) => (
                    <div
                        key={`${question.id}-${choiceIndex}`}
                        className={cn(
                            "flex items-start gap-2.5 rounded-xl px-3 py-2.5 ring-1",
                            choice.isCorrect
                                ? "bg-primary/6 text-foreground ring-primary/20"
                                : "bg-muted/35 text-muted-foreground ring-border/50"
                        )}
                    >
                        <div className={cn(
                            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                            choice.isCorrect ? "bg-primary text-primary-foreground" : "bg-background ring-1 ring-border"
                        )}>
                            {choice.isCorrect ? <Check /> : <span className="font-mono text-[10px]">{choiceIndex + 1}</span>}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm leading-relaxed">{choice.text}</p>
                            {choice.explanation && choice.isCorrect && (
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{choice.explanation}</p>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>

            {question.explanation && (
                <div className="mx-4 flex items-start gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                    <Lightbulb className="mt-0.5 shrink-0 text-primary" />
                    <p><span className="font-semibold text-foreground">{t("card.explanation")}</span> {question.explanation}</p>
                </div>
            )}
        </Card>
    );
}
