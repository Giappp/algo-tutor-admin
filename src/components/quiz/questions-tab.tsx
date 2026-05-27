"use client";

import {useState} from "react";
import {Check, FileQuestion, Pencil, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {QuizQuestion} from "@/types/learning-path";
import {QuestionRequestDTO} from "@/types/learning-path/schema";
import {useCreateQuestion, useDeleteQuestion, useQuestionsByLesson, useUpdateQuestion} from "@/hooks/use-quiz";
import QuestionDialog from "@/components/quiz/question-dialog";

interface QuestionsTabProps {
    lessonId: number;
}

export function QuestionsTab({lessonId}: QuestionsTabProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<QuizQuestion | null>(null);

    const {data: questions = [], isLoading} = useQuestionsByLesson(lessonId);
    const createMutation = useCreateQuestion(lessonId);
    const updateMutation = useUpdateQuestion(editing?.id ?? 0);
    const deleteMutation = useDeleteQuestion();

    const handleSubmit = async (formData: QuestionRequestDTO) => {
        if (editing) {
            await updateMutation.mutateAsync(formData);
        } else {
            await createMutation.mutateAsync(formData);
        }
        setIsFormOpen(false);
        setEditing(null);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this question?")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">Quiz Questions</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Create questions to assess student understanding
                    </p>
                </div>
                <Button onClick={() => {
                    setEditing(null);
                    setIsFormOpen(true);
                }}>
                    <Plus className="size-4 mr-2"/>
                    Add Question
                </Button>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 rounded-xl bg-muted animate-pulse"/>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && questions.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <FileQuestion className="size-8 text-muted-foreground"/>
                        </div>
                        <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                            Add questions to assess student understanding. Each question can have multiple choice
                            answers.
                        </p>
                        <Button onClick={() => {
                            setEditing(null);
                            setIsFormOpen(true);
                        }}>
                            <Plus className="size-4 mr-2"/>
                            Add First Question
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Questions list */}
            {!isLoading && questions.length > 0 && (
                <div className="space-y-4">
                    {questions.map((q: QuizQuestion) => (
                        <QuestionCard
                            key={q.id}
                            question={q}
                            index={q.orderIndex}
                            onEdit={() => {
                                setEditing(q);
                                setIsFormOpen(true);
                            }}
                            onDelete={() => handleDelete(q.id)}
                        />
                    ))}
                </div>
            )}

            {/* Summary */}
            {!isLoading && questions.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{questions.reduce((sum, q) => sum + q.points, 0)} total points</span>
                </div>
            )}

            {/* Form Dialog */}
            <QuestionDialog
                open={isFormOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsFormOpen(false);
                        setEditing(null);
                    }
                }}
                question={editing}
                onSubmit={handleSubmit}
                isPending={editing ? updateMutation.isPending : createMutation.isPending}
            />
        </div>
    );
}


interface QuestionCardProps {
    question: QuizQuestion;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}

function QuestionCard({question: q, index, onEdit, onDelete}: QuestionCardProps) {
    return (
        <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center justify-center size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-sm font-semibold">
                            {index + 1}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline"
                                   className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                {q.type.replace(/_/g, " ")}
                            </Badge>
                            <Badge variant="outline" className="font-medium">
                                {q.points} pt{q.points !== 1 ? "s" : ""}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={onEdit}>
                            <Pencil className="size-4"/>
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={onDelete}
                                className="text-destructive hover:text-destructive">
                            <Trash2 className="size-4"/>
                        </Button>
                    </div>
                </div>

                {/* Question text */}
                <p className="text-base font-medium mb-4">{q.question}</p>

                {/* Choices */}
                <div className="space-y-2">
                    {q.choices.map((choice, index) => (
                        <div
                            key={`${q.id}-${index}`}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                choice.isCorrect
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                            }`}
                        >
                            <div
                                className={`flex items-center justify-center size-5 rounded-full border-2 shrink-0 mt-0.5 ${
                                    choice.isCorrect
                                        ? "bg-emerald-500 border-emerald-500"
                                        : "border-muted-foreground/30"
                                }`}>
                                {choice.isCorrect && <Check className="size-3 text-white"/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">{choice.text}</p>
                                {choice.explanation && choice.isCorrect && (
                                    <p className="text-sm text-muted-foreground mt-1">{choice.explanation}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Explanation */}
                {q.explanation && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-dashed">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Explanation: </span>
                            {q.explanation}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}