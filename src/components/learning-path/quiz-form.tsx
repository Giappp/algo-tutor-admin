"use client";

import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {TooltipProvider} from "@/components/ui/tooltip";
import {FormField} from "@/components/learning-path/form-field";
import type {CreateQuizLesson} from "@/types/learning-path/schema";
import {CreateQuizLessonSchema} from "@/types/learning-path/schema";
import {Difficulty, QuestionType} from "@/types/learning-path";
import QuestionCard from "@/components/quiz/question-card";
import SectionCard from "@/components/quiz/section-card";

const DIFFICULTY_OPTIONS: {
    value: Difficulty;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
}[] = [
    {
        value: "EASY",
        label: "Easy",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30"
    },
    {
        value: "MEDIUM",
        label: "Medium",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30"
    },
    {
        value: "HARD",
        label: "Hard",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30"
    },
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
    trigger: () => Promise<boolean>;
    submit: () => Promise<void>;
};

export type {QuizFormHandle};

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
                             formRef: externalFormRef,
                         }: QuizFormProps) {
    const internalFormRef = useRef<QuizFormHandle | null>(null);
    const formRef = externalFormRef ?? internalFormRef;

    const [activeSection, setActiveSection] = useState<string>("basic");
    // Flat local state for questions — avoids watch() re-rendering the whole form
    const [questions, setQuestions] = useState<QuestionInput[]>([]);

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

    useEffect(() => {
        if (!defaultValues) return;
        const qs: QuestionInput[] = (defaultValues.questions ?? []).map((q) => ({
            question: q.question,
            type: q.type ?? "MULTIPLE_CHOICE",
            points: q.points ?? 10,
            explanation: q.explanation ?? "",
            choices: q.choices.map((c) => ({
                text: c.text,
                isCorrect: c.isCorrect,
                explanation: c.explanation ?? "",
            })),
        }));
        setQuestions(qs);
        reset({
            type: "QUIZ",
            title: defaultValues.title ?? "",
            difficulty: defaultValues.difficulty,
            passingScore: defaultValues.passingScore ?? 70,
            timeLimitMinutes: defaultValues.timeLimitMinutes,
        });
    }, [defaultValues]);

    const watchedDifficulty = watch("difficulty");
    const watchedPassingScore = watch("passingScore");

    // Stats — memoized so they only recompute when questions change
    const stats = useMemo(() => ({
        questionCount: questions.length,
        totalPoints: questions.reduce((s, q) => s + q.points, 0),
        answeredCount: questions.filter((q) => q.choices.some((c) => c.isCorrect)).length,
    }), [questions]);

    const toggleSection = useCallback((section: string) => {
        setActiveSection((prev) => prev === section ? "" : section);
    }, []);

    const addQuestion = useCallback(() => {
        const newQ: QuestionInput = {
            question: "",
            type: "MULTIPLE_CHOICE",
            points: 10,
            explanation: "",
            choices: [
                {text: "", isCorrect: false, explanation: ""},
                {text: "", isCorrect: false, explanation: ""},
            ],
        };
        setQuestions((prev) => [...prev, newQ]);
        setActiveSection("questions");
    }, []);

    const removeQuestion = useCallback((index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const updateQuestion = useCallback((index: number, updated: QuestionInput) => {
        setQuestions((prev) => prev.map((q, i) => i === index ? updated : q));
    }, []);

    const handleFormSubmit = handleSubmit(async (data) => {
        await onSubmit({...data, questions: questions as unknown as CreateQuizLesson["questions"]});
    });

    useImperativeHandle(formRef, () => ({
        trigger: async () => {
            let valid = false;
            await handleSubmit(() => {
                valid = true;
            })();
            return valid;
        },
        submit: async () => {
            await handleFormSubmit();
        },
    }));

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

                    <SectionCard
                        number="01"
                        title="Basic Information"
                        color="indigo"
                        badge={watchedDifficulty ? 1 : undefined}
                        isOpen={activeSection === "basic"}
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
                                    {DIFFICULTY_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setValue("difficulty", opt.value as Difficulty)}
                                            className={cn(
                                                "flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-150",
                                                watchedDifficulty === opt.value
                                                    ? opt.bgColor + " " + opt.borderColor + " " + opt.color + " shadow-sm scale-[1.02]"
                                                    : "border-border/60 hover:border-muted-foreground/40 hover:bg-muted/60"
                                            )}
                                        >
                                            <span
                                                className="text-xs font-black tracking-widest">{opt.label.charAt(0)}</span>
                                            <span>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </FormField>
                        </div>
                    </SectionCard>

                    {/* ── 02 Quiz Settings ── */}
                    <SectionCard
                        number="02"
                        title="Quiz Settings"
                        color="cyan"
                        isOpen={activeSection === "settings"}
                        onToggle={() => toggleSection("settings")}
                    >
                        <div className="flex flex-col gap-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField label="Passing Score" error={errors.passingScore?.message}
                                           description="Minimum percentage to pass">
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
                                <FormField label="Time Limit" error={errors.timeLimitMinutes?.message}
                                           description="Leave blank for no time limit">
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
                                <StatCard label="Questions" value={stats.questionCount}/>
                                <StatCard label="Total Points" value={stats.totalPoints}/>
                                <StatCard label="Answered" value={`${stats.answeredCount}/${stats.questionCount}`}/>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ── 03 Questions ── */}
                    <SectionCard
                        number="03"
                        title="Questions"
                        color="amber"
                        badge={questions.length > 0 ? questions.length : undefined}
                        isOpen={activeSection === "questions"}
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

                            {questions.length === 0 && (
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

                            {questions.map((q, qi) => (
                                <QuestionCard
                                    key={qi}
                                    question={q}
                                    index={qi}
                                    isPending={isPending}
                                    onChange={(updated) => updateQuestion(qi, updated)}
                                    onRemove={() => removeQuestion(qi)}
                                />
                            ))}

                            <Button type="button" variant="outline" size="sm" onClick={addQuestion}
                                    className="self-start">
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
                        <Button type="submit" disabled={isPending} size="lg" className="px-8 gap-2">
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

const StatCard = React.memo(function StatCard({label, value}: { label: string; value: number | string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-3 gap-1">
            <span className="text-xl font-bold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
});