"use client";

import {useState} from "react";
import {Check, FileQuestion, Pencil, Plus, Trash2, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {QuizQuestion, QuestionType} from "@/types/learning-path";
import {CreateQuestion} from "@/types/learning-path/schema";
import {useQuestionsByLesson, useCreateQuestion, useUpdateQuestion, useDeleteQuestion} from "@/hooks/use-quiz";

interface QuestionsTabProps {
    lessonId: number;
}

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
    {value: "MULTIPLE_CHOICE", label: "Multiple Choice"},
    {value: "SINGLE_CHOICE", label: "Single Choice"},
    {value: "TRUE_FALSE", label: "True/False"},
];

export function QuestionsTab({lessonId}: QuestionsTabProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<QuizQuestion | null>(null);

    const {data: questions = [], isLoading} = useQuestionsByLesson(lessonId);
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
                <Button onClick={() => { setEditing(null); setIsFormOpen(true); }}>
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
                            Add questions to assess student understanding. Each question can have multiple choice answers.
                        </p>
                        <Button onClick={() => { setEditing(null); setIsFormOpen(true); }}>
                            <Plus className="size-4 mr-2"/>
                            Add First Question
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Questions list */}
            {!isLoading && questions.length > 0 && (
                <div className="space-y-4">
                    {questions.map((q: QuizQuestion, index: number) => (
                        <QuestionCard
                            key={q.id}
                            question={q}
                            index={index}
                            onEdit={() => { setEditing(q); setIsFormOpen(true); }}
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
                onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setEditing(null); } }}
                question={editing}
                onSubmit={handleSubmit}
                isPending={editing ? updateMutation.isPending : createMutation.isPending}
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Question Card Component
// ---------------------------------------------------------------------------
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
                        <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-sm font-semibold">
                            {index + 1}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
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
                        <Button variant="ghost" size="icon-xs" onClick={onDelete} className="text-destructive hover:text-destructive">
                            <Trash2 className="size-4"/>
                        </Button>
                    </div>
                </div>

                {/* Question text */}
                <p className="text-base font-medium mb-4">{q.question}</p>

                {/* Choices */}
                <div className="space-y-2">
                    {q.choices.map((choice) => (
                        <div
                            key={choice.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                choice.isCorrect
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                            }`}
                        >
                            <div className={`flex items-center justify-center size-5 rounded-full border-2 shrink-0 mt-0.5 ${
                                choice.isCorrect
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "border-muted-foreground/30"
                            }`}>
                                {choice.isCorrect && <Check className="size-3 text-white"/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">{choice.text}</p>
                                {choice.explanation && choice.isCorrect && (
                                    <p className="text-xs text-muted-foreground mt-1">{choice.explanation}</p>
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

// ---------------------------------------------------------------------------
// Question Form Dialog
// ---------------------------------------------------------------------------
interface QuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: QuizQuestion | null;
    onSubmit: (data: CreateQuestion) => Promise<void>;
    isPending: boolean;
}

interface ChoiceItem {
    id?: number;
    text: string;
    isCorrect: boolean;
    explanation: string;
}

function QuestionDialog({open, onOpenChange, question, onSubmit, isPending}: QuestionDialogProps) {
    const [questionText, setQuestionText] = useState(question?.question ?? "");
    const [questionType, setQuestionType] = useState<QuestionType>(question?.type ?? "MULTIPLE_CHOICE");
    const [points, setPoints] = useState(question?.points ?? 1);
    const [explanation, setExplanation] = useState(question?.explanation ?? "");
    const [choices, setChoices] = useState<ChoiceItem[]>(
        question?.choices.map((c) => ({
            id: c.id,
            text: c.text,
            isCorrect: c.isCorrect,
            explanation: c.explanation ?? "",
        })) ?? [
            {text: "", isCorrect: true, explanation: ""},
            {text: "", isCorrect: false, explanation: ""},
        ]
    );

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setQuestionText(question?.question ?? "");
            setQuestionType(question?.type ?? "MULTIPLE_CHOICE");
            setPoints(question?.points ?? 1);
            setExplanation(question?.explanation ?? "");
            setChoices(
                question?.choices.map((c) => ({
                    id: c.id,
                    text: c.text,
                    isCorrect: c.isCorrect,
                    explanation: c.explanation ?? "",
                })) ?? [
                    {text: "", isCorrect: true, explanation: ""},
                    {text: "", isCorrect: false, explanation: ""},
                ]
            );
        }
        onOpenChange(open);
    };

    const addChoice = () => {
        setChoices([...choices, {text: "", isCorrect: false, explanation: ""}]);
    };

    const removeChoice = (index: number) => {
        if (choices.length > 2) {
            setChoices(choices.filter((_, i) => i !== index));
        }
    };

    const updateChoice = (index: number, field: keyof ChoiceItem, value: string | boolean) => {
        const newChoices = [...choices];
        newChoices[index] = {...newChoices[index], [field]: value};

        // If setting as correct, uncheck others (for single choice)
        if (field === "isCorrect" && value === true) {
            newChoices.forEach((c, i) => {
                if (i !== index) c.isCorrect = false;
            });
        }

        setChoices(newChoices);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            question: questionText,
            type: questionType,
            points,
            explanation: explanation || undefined,
            choices: choices
                .filter((c) => c.text.trim())
                .map((c) => ({
                    text: c.text,
                    isCorrect: c.isCorrect,
                    explanation: c.explanation || undefined,
                })),
        });
    };

    const isValid = questionText.trim() && choices.filter((c) => c.text.trim()).length >= 2 && choices.some((c) => c.isCorrect);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {question ? "Edit Question" : "Add Question"}
                    </DialogTitle>
                    <DialogDescription>
                        Create a question with multiple choice answers.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Question text */}
                    <div className="space-y-2">
                        <Label htmlFor="question" className="text-sm font-medium">
                            Question <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="question"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="What is the time complexity of array access?"
                            className="text-sm min-h-[80px]"
                            required
                        />
                    </div>

                    {/* Type & Points row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Question Type</Label>
                            <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="points" className="text-sm font-medium">Points</Label>
                            <Input
                                id="points"
                                type="number"
                                min={1}
                                max={100}
                                value={points}
                                onChange={(e) => setPoints(Number(e.target.value))}
                                className="text-sm"
                            />
                        </div>
                    </div>

                    {/* Choices */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            Answer Choices <span className="text-destructive">*</span>
                        </Label>
                        {choices.map((choice, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <button
                                    type="button"
                                    onClick={() => updateChoice(index, "isCorrect", !choice.isCorrect)}
                                    className={`mt-2.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                        choice.isCorrect
                                            ? "bg-emerald-500 border-emerald-500"
                                            : "border-muted-foreground/30 hover:border-muted-foreground"
                                    }`}
                                >
                                    {choice.isCorrect && <Check className="size-3 text-white"/>}
                                </button>
                                <div className="flex-1 space-y-1">
                                    <Input
                                        value={choice.text}
                                        onChange={(e) => updateChoice(index, "text", e.target.value)}
                                        placeholder={`Choice ${index + 1}`}
                                        className="text-sm"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => removeChoice(index)}
                                    disabled={choices.length <= 2}
                                    className="mt-1 text-muted-foreground"
                                >
                                    <X className="size-4"/>
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addChoice} className="mt-2">
                            <Plus className="size-4 mr-2"/>
                            Add Choice
                        </Button>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-2">
                        <Label htmlFor="explanation" className="text-sm font-medium">
                            Explanation (shown after answering)
                        </Label>
                        <Textarea
                            id="explanation"
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Explain why this is the correct answer..."
                            className="text-sm min-h-[60px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || !isValid}>
                            {isPending ? "Saving..." : question ? "Save Changes" : "Add Question"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
