"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {FormField} from "@/components/learning-path/form-field";
import type {CreateQuizLesson} from "@/types/learning-path/schema";
import {CreateQuizLessonSchema} from "@/types/learning-path/schema";
import {Difficulty, QuestionType} from "@/types/learning-path";

const DIFFICULTY_OPTIONS: {
    value: Difficulty;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string
}[] = [
    {
        value: "EASY",
        label: "Easy",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
    },
    {
        value: "MEDIUM",
        label: "Medium",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
    },
    {
        value: "HARD",
        label: "Hard",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
    },
];

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string; description: string }[] = [
    {value: "MULTIPLE_CHOICE", label: "Multiple Choice", description: "Multiple correct answers"},
    {value: "SINGLE_CHOICE", label: "Single Choice", description: "One correct answer"},
    {value: "TRUE_FALSE", label: "True / False", description: "True or false question"},
];

interface ChoiceInput {
    text: string;
    isCorrect: boolean;
    explanation: string;
}

interface QuestionInput {
    question: string;
    type: QuestionType;
    points: number;
    explanation: string;
    choices: ChoiceInput[];
}

type QuizFormHandle = {
    submit: () => Promise<void>;
};

interface QuizFormProps {
    defaultValues?: Partial<CreateQuizLesson>;
    onSubmit: (data: CreateQuizLesson) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    editMode?: boolean;
    formRef?: React.RefObject<QuizFormHandle | null>;
}

export function QuizForm({
                             defaultValues,
                             onSubmit,
                             isPending,
                             submitLabel = "Create Lesson",
                             editMode,
                             formRef,
                         }: QuizFormProps) {
    const [activeSection, setActiveSection] = useState<string>("basic");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: {errors},
    } = useForm<CreateQuizLesson>({
        resolver: zodResolver(CreateQuizLessonSchema),
        defaultValues: {
            type: "QUIZ",
            title: "",
            difficulty: undefined,
            passingScore: 70,
            timeLimitMinutes: undefined,
            questions: [],
            ...defaultValues,
        },
    });

    const watchedDifficulty = watch("difficulty");
    const watchedQuestions = watch("questions") as unknown as QuestionInput[] ?? [];
    const watchedPassingScore = watch("passingScore");

    useEffect(() => {
        if (defaultValues) {
            const processed = {
                type: "QUIZ" as const,
                title: defaultValues.title ?? "",
                difficulty: defaultValues.difficulty,
                passingScore: defaultValues.passingScore ?? 70,
                timeLimitMinutes: defaultValues.timeLimitMinutes,
                questions: (defaultValues.questions ?? []) as unknown as QuestionInput[],
            };
            reset(processed);
        }
    }, [defaultValues, reset]);

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? section : section);
    };
    const isOpen = (section: string) => activeSection === section;

    // Question management
    const addQuestion = () => {
        const current = [...(watchedQuestions || [])];
        current.push({
            question: "",
            type: "MULTIPLE_CHOICE",
            points: 10,
            explanation: "",
            choices: [
                {text: "", isCorrect: false, explanation: ""},
                {text: "", isCorrect: false, explanation: ""},
            ],
        });
        setValue("questions" as const, current);
        setActiveSection("questions");
    };

    const removeQuestion = (index: number) => {
        const current = [...((watchedQuestions || []) as QuestionInput[])];
        current.splice(index, 1);
        setValue("questions" as const, current);
    };

    const updateQuestion = (index: number, field: keyof QuestionInput, value: string | number | QuestionInput[]) => {
        const current = [...((watchedQuestions || []) as QuestionInput[])];
        current[index] = {...current[index], [field]: value};
        setValue("questions" as const, current);
    };

    // Choice management
    const addChoice = (questionIndex: number) => {
        const current = [...((watchedQuestions || []) as QuestionInput[])];
        current[questionIndex].choices.push({text: "", isCorrect: false, explanation: ""});
        setValue("questions" as const, current);
    };

    const removeChoice = (questionIndex: number, choiceIndex: number) => {
        const current = [...((watchedQuestions || []) as QuestionInput[])];
        current[questionIndex].choices.splice(choiceIndex, 1);
        setValue("questions" as const, current);
    };

    const updateChoice = (questionIndex: number, choiceIndex: number, field: keyof ChoiceInput, value: string | boolean) => {
        const current = [...((watchedQuestions || []) as QuestionInput[])];
        current[questionIndex].choices[choiceIndex] = {...current[questionIndex].choices[choiceIndex], [field]: value};
        setValue("questions" as const, current);
    };

    const setCorrectChoice = (questionIndex: number, choiceIndex: number) => {
        const current = [...((watchedQuestions || []) as QuestionInput[])];
        const q = current[questionIndex];
        if (q.type === "TRUE_FALSE") {
            // Only one correct answer allowed
            q.choices = q.choices.map((c, i) => ({...c, isCorrect: i === choiceIndex}));
        } else {
            // Toggle
            q.choices[choiceIndex].isCorrect = !q.choices[choiceIndex].isCorrect;
        }
        setValue("questions" as const, current);
    };

    const handleFormSubmit = handleSubmit(async (data) => {
        await onSubmit({...data, questions: watchedQuestions as unknown as CreateQuizLesson["questions"]});
    });

    if (formRef) {
        formRef.current = {submit: handleFormSubmit};
    }

    return (
        <TooltipProvider>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div
                        className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                             className="text-amber-600 dark:text-amber-400">
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.75"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75"/>
                            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2"
                                  strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight">Quiz Assessment</h2>
                        <p className="text-sm text-muted-foreground">Build a knowledge check with multiple choice
                            questions</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">

                    {/* ── 01 Basic Information ── */}
                    <SectionCard
                        number="01"
                        title="Basic Information"
                        color="indigo"
                        badge={watchedDifficulty ? 1 : undefined}
                        isOpen={isOpen("basic")}
                        onToggle={() => toggleSection("basic")}
                    >
                        <div className="flex flex-col gap-6">
                            <FormField label="Quiz Title" error={errors.title?.message} required
                                       description="A clear name for the assessment">
                                <Input
                                    id="title"
                                    placeholder="e.g. Arrays Fundamentals Quiz"
                                    className="text-base h-11"
                                    aria-invalid={!!errors.title}
                                    disabled={isPending}
                                    {...register("title")}
                                />
                            </FormField>

                            <FormField label="Difficulty" error={errors.difficulty?.message}
                                       description="How challenging is this quiz?">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {DIFFICULTY_OPTIONS.map((opt) => {
                                        const isSelected = watchedDifficulty === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setValue("difficulty", opt.value as Difficulty)}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-150",
                                                    isSelected
                                                        ? opt.bgColor + " " + opt.borderColor + " " + opt.color + " shadow-sm scale-[1.02]"
                                                        : "border-border/60 hover:border-muted-foreground/40 hover:bg-muted/60"
                                                )}
                                            >
                                                <span
                                                    className="text-xs font-black tracking-widest">{opt.label.charAt(0)}</span>
                                                <span>{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </FormField>
                        </div>
                    </SectionCard>

                    {/* ── 02 Quiz Settings ── */}
                    <SectionCard
                        number="02"
                        title="Quiz Settings"
                        color="cyan"
                        isOpen={isOpen("settings")}
                        onToggle={() => toggleSection("settings")}
                    >
                        <div className="flex flex-col gap-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField
                                    label="Passing Score"
                                    error={errors.passingScore?.message}
                                    description="Minimum percentage to pass"
                                >
                                    <div className="relative">
                                        <Input
                                            id="passingScore"
                                            type="number"
                                            min={0}
                                            max={100}
                                            className="pr-10"
                                            {...register("passingScore", {valueAsNumber: true})}
                                            disabled={isPending}
                                        />
                                        <span
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">%</span>
                                    </div>
                                    <div className="mt-2">
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all"
                                                style={{width: `${watchedPassingScore ?? 70}%`}}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {watchedPassingScore ?? 70}% required to pass
                                        </p>
                                    </div>
                                </FormField>

                                <FormField
                                    label="Time Limit"
                                    error={errors.timeLimitMinutes?.message}
                                    description="Leave blank for no time limit"
                                >
                                    <div className="relative">
                                        <Input
                                            id="timeLimitMinutes"
                                            type="number"
                                            min={1}
                                            max={300}
                                            placeholder="No limit"
                                            className="pr-12"
                                            {...register("timeLimitMinutes", {valueAsNumber: true})}
                                            disabled={isPending}
                                        />
                                        <span
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">min</span>
                                    </div>
                                </FormField>
                            </div>

                            {/* Quick stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div
                                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-3 gap-1">
                                    <span className="text-xl font-bold text-foreground">{watchedQuestions.length}</span>
                                    <span className="text-xs text-muted-foreground">Questions</span>
                                </div>
                                <div
                                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-3 gap-1">
                                    <span className="text-xl font-bold text-foreground">
                                        {watchedQuestions.reduce((sum, q) => sum + (q.points || 10), 0)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Total Points</span>
                                </div>
                                <div
                                    className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-3 gap-1">
                                    <span className="text-xl font-bold text-foreground">
                                        {watchedQuestions.filter(q => q.choices.some(c => c.isCorrect)).length}/{watchedQuestions.length}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Answered</span>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ── 03 Questions ── */}
                    <SectionCard
                        number="03"
                        title="Questions"
                        color="amber"
                        badge={watchedQuestions.length > 0 ? watchedQuestions.length : undefined}
                        isOpen={isOpen("questions")}
                        onToggle={() => toggleSection("questions")}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="1.75">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 16v-4M12 8h.01"/>
                                </svg>
                                <span>Questions are embedded directly in the lesson payload. Set the correct answer by clicking the radio/checkbox next to each choice.</span>
                            </div>

                            {watchedQuestions.length === 0 && (
                                <div
                                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 py-10 gap-3">
                                    <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="1.75" className="text-muted-foreground">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
                                        </svg>
                                    </div>
                                    <p className="text-sm text-muted-foreground">No questions added yet.</p>
                                    <p className="text-xs text-muted-foreground/60">Add at least one question to create
                                        a meaningful quiz.</p>
                                </div>
                            )}

                            {watchedQuestions.map((q, qi) => (
                                <div key={qi} className="rounded-xl border bg-card overflow-hidden">
                                    {/* Question Header */}
                                    <div
                                        className="flex items-center justify-between px-4 py-3 bg-amber-500/5 border-b">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="inline-flex items-center justify-center size-6 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black">
                                                {qi + 1}
                                            </span>
                                            <span className="text-sm font-semibold">Question {qi + 1}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {q.points} pts
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <span
                                                        className="inline-flex items-center justify-center size-6 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                                                        {q.points}
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent><p className="text-xs">Points for this question</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => removeQuestion(qi)}
                                                className="text-muted-foreground/50 hover:text-destructive"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2">
                                                    <path
                                                        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col gap-4">
                                        {/* Question text */}
                                        <FormField label="Question Text" className="text-xs" required>
                                            <textarea
                                                placeholder="What is the time complexity of accessing an element in an array by index?"
                                                className="w-full min-h-16 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring/50"
                                                value={q.question}
                                                onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                                                disabled={isPending}
                                            />
                                        </FormField>

                                        {/* Question type + points row */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormField label="Question Type" className="text-xs">
                                                <select
                                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 h-9"
                                                    value={q.type}
                                                    onChange={(e) => updateQuestion(qi, "type", e.target.value as QuestionType)}
                                                    disabled={isPending}
                                                >
                                                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormField>
                                            <FormField label="Points" className="text-xs">
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={100}
                                                    value={q.points}
                                                    onChange={(e) => updateQuestion(qi, "points", Number(e.target.value))}
                                                    disabled={isPending}
                                                />
                                            </FormField>
                                        </div>

                                        {/* Choices */}
                                        <FormField label="Choices" className="text-xs"
                                                   description={
                                                       q.type === "MULTIPLE_CHOICE"
                                                           ? "Check all correct answers"
                                                           : q.type === "SINGLE_CHOICE"
                                                               ? "Select the one correct answer"
                                                               : "Mark the correct statement"
                                                   }>
                                            <div className="flex flex-col gap-2">
                                                {q.choices.map((choice, ci) => (
                                                    <div key={ci} className="group flex items-start gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setCorrectChoice(qi, ci)}
                                                            className={cn(
                                                                "shrink-0 mt-2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                                                                choice.isCorrect
                                                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                                                    : "border-muted-foreground/40 hover:border-amber-500"
                                                            )}
                                                        >
                                                            {choice.isCorrect && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-white"/>
                                                            )}
                                                        </button>
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder={`Choice ${ci + 1}`}
                                                                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                                                                value={choice.text}
                                                                onChange={(e) => updateChoice(qi, ci, "text", e.target.value)}
                                                                disabled={isPending}
                                                            />
                                                            {q.choices.length > 2 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon-xs"
                                                                    onClick={() => removeChoice(qi, ci)}
                                                                    className="shrink-0 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24"
                                                                         fill="none" stroke="currentColor"
                                                                         strokeWidth="2">
                                                                        <path d="M18 6L6 18M6 6l12 12"/>
                                                                    </svg>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="xs"
                                                    onClick={() => addChoice(qi)}
                                                    className="self-start mt-1"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                         stroke="currentColor" strokeWidth="2" className="mr-1">
                                                        <path d="M12 5v14M5 12h14"/>
                                                    </svg>
                                                    Add Choice
                                                </Button>
                                            </div>
                                        </FormField>

                                        {/* Explanation */}
                                        <FormField label="Explanation (shown after answering)" className="text-xs"
                                                   description="Optional explanation for the correct answer">
                                            <Input
                                                placeholder="Array elements can be accessed directly using their index in O(1) time."
                                                value={q.explanation}
                                                onChange={(e) => updateQuestion(qi, "explanation", e.target.value)}
                                                disabled={isPending}
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addQuestion}
                                className="self-start"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="2" className="mr-1.5">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                                Add Question
                            </Button>
                        </div>
                    </SectionCard>
                </div>

                {/* Submit Button */}
                {!editMode && (
                    <div className="flex justify-end pt-6 border-t">
                        <Button
                            type="submit"
                            disabled={isPending}
                            size="lg"
                            className="px-8 gap-2"
                        >
                            {isPending ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                         strokeWidth="2">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                        <polyline points="17 21 17 13 7 13 7 21"/>
                                        <polyline points="7 3 7 8 15 8"/>
                                    </svg>
                                    {submitLabel}
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </TooltipProvider>
    );
}

// ---------------------------------------------------------------------------
// Section Card Component (shared with coding-lesson-form)
// ---------------------------------------------------------------------------
interface SectionCardProps {
    number: string;
    title: string;
    color: "indigo" | "amber" | "rose" | "cyan" | "violet" | "emerald";
    badge?: number;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    indigo: {
        bg: "bg-indigo-500/10",
        text: "text-indigo-600 dark:text-indigo-400",
        border: "border-indigo-500/20",
        dot: "bg-indigo-500"
    },
    amber: {
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/20",
        dot: "bg-amber-500"
    },
    rose: {
        bg: "bg-rose-500/10",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-500/20",
        dot: "bg-rose-500"
    },
    cyan: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-600 dark:text-cyan-400",
        border: "border-cyan-500/20",
        dot: "bg-cyan-500"
    },
    violet: {
        bg: "bg-violet-500/10",
        text: "text-violet-600 dark:text-violet-400",
        border: "border-violet-500/20",
        dot: "bg-violet-500"
    },
    emerald: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20",
        dot: "bg-emerald-500"
    },
};

function SectionCard({number, title, color, badge, isOpen, onToggle, children}: SectionCardProps) {
    const cfg = COLOR_MAP[color];

    return (
        <div className={cn("border rounded-2xl overflow-hidden transition-all duration-200",
            isOpen ? "bg-muted/20 border-muted-foreground/10 shadow-sm" : "bg-card hover:bg-muted/30 hover:border-muted-foreground/15")}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-3.5 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
                <div
                    className={cn("shrink-0 flex items-center justify-center size-8 rounded-lg font-black text-sm tracking-tight",
                        cfg.bg, cfg.text)}>
                    {number}
                </div>
                <span className="flex-1 font-semibold text-sm">{title}</span>
                {badge !== undefined && (
                    <Badge variant="secondary" className="shrink-0 tabular-nums">
                        {badge}
                    </Badge>
                )}
                <span className={cn(
                    "shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                )}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </span>
            </button>
            {isOpen && (
                <div className="px-5 pb-6">
                    <div
                        className={cn("h-px bg-gradient-to-r from-transparent", cfg.bg.replace("/10", "/20"), "to-transparent mb-6 -mt-1")}/>
                    {children}
                </div>
            )}
        </div>
    );
}