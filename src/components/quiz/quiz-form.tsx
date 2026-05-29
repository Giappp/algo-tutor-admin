"use client";

import React, { useCallback, useImperativeHandle } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FormField } from "@/components/learning-path/form-field";
import type { QuizLessonDTO } from "@/types/learning-path/schema";
import { CreateQuizLessonSchema, EditQuizContentSchema } from "@/types/learning-path/schema";
import { Difficulty } from "@/types/learning-path";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    editMode?: boolean;
    formRef?: React.RefObject<QuizFormHandle | null>;
}

export function QuizForm({
    defaultValues,
    onSubmit,
    isPending,
    submitLabel = "Create Lesson",
    editMode = false,
    formRef: externalFormRef,
}: QuizFormProps) {

    const {
        register,
        handleSubmit,
        setValue,
        control,
        trigger,
        formState: { errors },
    } = useForm<QuizLessonDTO>({
        resolver: zodResolver(editMode ? EditQuizContentSchema : CreateQuizLessonSchema),
        defaultValues: {
            type: "QUIZ",
            title: "",
            difficulty: undefined,
            passingScore: 70,
            timeLimitMinutes: undefined,
            ...defaultValues,
        },
    });

    const watchedDifficulty = useWatch({
        name: "difficulty",
        control
    });
    const watchedPassingScore = useWatch({
        name: "passingScore",
        control
    });

    const onFormSubmit = handleSubmit(async (data) => {
        await onSubmit(data);
    }, (formErrors) => {
        const findFirstError = (obj: Record<string, unknown>): string | undefined => {
            for (const value of Object.values(obj)) {
                if (value && typeof value === "object") {
                    if ("message" in value && typeof (value as { message: unknown }).message === "string") {
                        return (value as { message: string }).message;
                    }
                    const nested = findFirstError(value as Record<string, unknown>);
                    if (nested) return nested;
                }
            }
            return undefined;
        };
        const msg = findFirstError(formErrors as unknown as Record<string, unknown>);
        toast.error(msg ?? "Please fix the validation errors before saving");
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
            <form onSubmit={onFormSubmit} className="flex flex-col gap-8 max-w-4xl mx-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4 border-b pb-6">
                    <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 shadow-sm shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-600 dark:text-amber-400">
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
                            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Create Quiz Assessment</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Define your assessment settings. You can add questions after creating the quiz.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Basic Information */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Basic Information
                        </h3>

                        <FormField label="Quiz Title" error={errors.title?.message} required description="A clear name for the assessment">
                            <Input
                                id="title"
                                placeholder="e.g. Arrays Fundamentals Quiz"
                                className="text-sm h-11"
                                aria-invalid={!!errors.title}
                                disabled={isPending}
                                {...register("title")}
                            />
                        </FormField>

                        <FormField label="Difficulty" error={errors.difficulty?.message} description="How challenging is this quiz?">
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
                                        <span className="text-sm font-black tracking-widest">{opt.label.charAt(0)}</span>
                                        <span>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </FormField>
                    </div>

                    {/* Quiz Settings */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Quiz Configuration
                        </h3>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <FormField label="Passing Score" error={errors.passingScore?.message} description="Minimum percentage to pass">
                                <div className="relative">
                                    <Input
                                        id="passingScore"
                                        type="number"
                                        min={0}
                                        max={100}
                                        className="pr-10 text-sm h-11"
                                        {...register("passingScore", { valueAsNumber: true })}
                                        disabled={isPending}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">%</span>
                                </div>
                                <div className="mt-3">
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                                            style={{ width: `${watchedPassingScore ?? 70}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {watchedPassingScore ?? 70}% required to pass
                                    </p>
                                </div>
                            </FormField>

                            <FormField label="Time Limit" error={errors.timeLimitMinutes?.message} description="Leave blank for no time limit">
                                <div className="relative">
                                    <Input
                                        id="timeLimitMinutes"
                                        type="number"
                                        min={1}
                                        max={300}
                                        placeholder="No limit"
                                        className="pr-12 text-sm h-11"
                                        {...register("timeLimitMinutes", { valueAsNumber: true })}
                                        disabled={isPending}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">min</span>
                                </div>
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t">
                    <Button type="submit" disabled={isPending} size="lg" className="px-8 gap-2 text-sm h-11">
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
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
