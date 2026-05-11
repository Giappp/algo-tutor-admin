"use client";

import React, {useCallback, useImperativeHandle, useState} from "react";
import {Control, useFieldArray, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {TooltipProvider} from "@/components/ui/tooltip";
import {FormField} from "@/components/learning-path/form-field";
import type {QuestionInput, QuestionRequestDTO, QuizLessonDTO} from "@/types/learning-path/schema";
import {CreateQuizLessonSchema} from "@/types/learning-path/schema";
import {Difficulty} from "@/types/learning-path";
import QuestionCard from "@/components/quiz/question-card";
import SectionCard from "@/components/quiz/section-card";
import {Loader2} from "lucide-react";

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

export type QuizFormHandle = {
    triggerValidation: () => Promise<boolean>;
    submit: () => void;
};

interface QuizFormProps {
    defaultValues?: Partial<QuizLessonDTO>;
    onSubmit: (data: QuizLessonDTO) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    formRef?: React.RefObject<QuizFormHandle | null>;
}

function QuizStats({control}: { control: Control<QuizLessonDTO> }) {
    const watchedQuestions = useWatch({control, name: "questions"}) as QuestionInput[];

    const stats = {
        questionCount: watchedQuestions.length,
        totalPoints: watchedQuestions.reduce((sum, q) => sum + (q.points ?? 0), 0),
        answeredCount: watchedQuestions.filter((q) => q.choices?.some((c) => c.isCorrect)).length,
    };

    return (
        <div className="grid grid-cols-3 gap-3">
            <div
                className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-3 gap-1">
                <span className="text-xl font-bold text-foreground">{stats.questionCount}</span>
                <span className="text-xs text-muted-foreground">Questions</span>
            </div>
            <div
                className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-3 gap-1">
                <span className="text-xl font-bold text-foreground">{stats.totalPoints}</span>
                <span className="text-xs text-muted-foreground">Total Points</span>
            </div>
            <div
                className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-3 gap-1">
                                    <span className="text-xl font-bold text-foreground">
                                        {stats.answeredCount}/{stats.questionCount}
                                    </span>
                <span className="text-xs text-muted-foreground">Answered</span>
            </div>
        </div>
    )
}

export function QuizForm({
                             defaultValues,
                             onSubmit,
                             isPending,
                             submitLabel = "Create Lesson",
                             formRef: externalFormRef,
                         }: QuizFormProps) {
    const [activeSection, setActiveSection] = useState<string>("basic");

    const {
        register,
        handleSubmit,
        setValue,
        control,
        trigger,
        getValues,
        formState: {errors},
    } = useForm<QuizLessonDTO>({
        resolver: zodResolver(CreateQuizLessonSchema),
        defaultValues: {
            type: "QUIZ",
            title: "",
            difficulty: undefined,
            passingScore: 70,
            timeLimitMinutes: undefined,
            questions: [] as QuestionInput[],
            ...defaultValues,
        },
    });

    const {fields, append, remove} = useFieldArray({
        control,
        name: "questions",
    });

    const watchedDifficulty = useWatch({
        name: "difficulty",
        control
    });
    const watchedPassingScore = useWatch({
        name: "passingScore",
        control
    });
    const toggleSection = (section: string) => {
        setActiveSection((prev) => prev === section ? "" : section);
    };

    const addQuestion = () => {
        const newQ: QuestionInput = {
            question: "",
            type: "MULTIPLE_CHOICE",
            points: 10,
            choices: [
                {text: "", isCorrect: false, explanation: ""},
                {text: "", isCorrect: false, explanation: ""},
            ],
        };
        append(newQ as QuestionRequestDTO);
        setActiveSection("questions");
    };

    const onFormSubmit = handleSubmit(async (data) => {
        await onSubmit(data);
    });

    const triggerValidation = useCallback(async (): Promise<boolean> => {
        return await trigger();
    }, [trigger]);

    const submit = useCallback(() => {
        onFormSubmit();
    }, [onFormSubmit]);

    useImperativeHandle(externalFormRef, () => ({
        triggerValidation,
        submit,
    }), [triggerValidation, submit]);

    return (
        <TooltipProvider>
            <form onSubmit={onFormSubmit} className="flex flex-col gap-8">
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
                        <QuizStats control={control}/>
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
                        </div>
                    </SectionCard>

                    {/* ── 03 Questions ── */}
                    <SectionCard
                        number="03"
                        title="Questions"
                        color="amber"
                        badge={fields.length > 0 ? fields.length : undefined}
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

                            {errors.questions?.root && (
                                <p className="text-sm text-destructive">{errors.questions.root.message}</p>
                            )}

                            {fields.length === 0 && (
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

                            {fields.map((field, qi) => (
                                <QuestionCard
                                    key={field.id}
                                    index={qi}
                                    isPending={isPending}
                                    onRemove={() => remove(qi)}
                                    control={control}
                                    setValue={setValue}   // Pass this
                                    getValues={getValues} // Pass this
                                />
                            ))}

                            <Button type="button" size="sm" onClick={addQuestion}
                                    className="self-start bg-amber-500 hover:bg-amber-600 text-white border-amber-500 hover:border-amber-600 shadow-sm">
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
                <div className="flex justify-end pt-6 border-t">
                    <Button type="submit" disabled={isPending} size="lg" className="px-8 gap-2">
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin"/>
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
            </form>
        </TooltipProvider>
    );
}
