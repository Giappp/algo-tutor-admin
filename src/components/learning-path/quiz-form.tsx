"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {LightbulbIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {FormField} from "@/components/learning-path/form-field";
import {CreateQuizLesson, CreateQuizLessonSchema} from "@/types/learning-path/schema";
import {RichTextEditorWithTemplates} from "@/components/ui/rich-text-editor";

const DIFFICULTY_OPTIONS = [
    {
        value: "EASY" as const,
        label: "Easy",
        color: "text-emerald-600 dark:text-emerald-400",
    },
    {
        value: "MEDIUM" as const,
        label: "Medium",
        color: "text-amber-600 dark:text-amber-400",
    },
    {
        value: "HARD" as const,
        label: "Hard",
        color: "text-red-600 dark:text-red-400",
    },
];

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
    const {
        register,
        handleSubmit: RHhandleSubmit,
        setValue,
        watch,
        formState: {errors},
    } = useForm<CreateQuizLesson>({
        resolver: zodResolver(CreateQuizLessonSchema),
        defaultValues: {
            type: "QUIZ",
            title: "",
            content: "",
            difficulty: undefined,
            orderIndex: undefined,
            passingScore: 70,
            timeLimitMinutes: undefined,
            ...defaultValues,
        },
    });

    const watchedContent = watch("content") ?? "";
    const watchedDifficulty = watch("difficulty");

    const handleSubmit = RHhandleSubmit(onSubmit);

    if (formRef) {
        formRef.current = {submit: handleSubmit};
    }

    return (
        <form id="quiz-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-7 rounded-md bg-amber-500/10">
                    <LightbulbIcon className="size-4 text-amber-600 dark:text-amber-400"/>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quiz Lesson
                </span>
            </div>

            {/* Title */}
            <FormField
                label="Title"
                error={errors.title?.message}
                required
            >
                <Input
                    id="title"
                    placeholder="e.g. Arrays Fundamentals Quiz"
                    aria-invalid={!!errors.title}
                    disabled={isPending}
                    className="max-w-2xl"
                    {...register("title")}
                />
            </FormField>

            {/* Difficulty */}
            <FormField label="Difficulty">
                <div className="flex items-center gap-2 flex-wrap">
                    {DIFFICULTY_OPTIONS.map((opt) => {
                        const isSelected = watchedDifficulty === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() =>
                                    setValue("difficulty", opt.value, {
                                        shouldValidate: true,
                                    })
                                }
                                className={cn(
                                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                                    isSelected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border hover:border-primary/50 hover:bg-muted"
                                )}
                            >
                                <span
                                    className={cn(isSelected ? "text-primary-foreground" : opt.color, "text-xs font-semibold")}>
                                    {opt.label.charAt(0)}
                                </span>
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            </FormField>

            {/* Content */}
            <FormField
                label="Problem Description"
                error={errors.content?.message}
                description="Describe the quiz topic. You can add questions after creating the lesson."
            >
                <RichTextEditorWithTemplates
                    value={watchedContent}
                    onChange={(val) => setValue("content", val, {shouldValidate: true})}
                    placeholder="Describe the quiz topic in detail..."
                    disabled={isPending}
                />
            </FormField>

            {/* Quiz Settings */}
            <div className="flex flex-col gap-4 pt-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Quiz Settings
                </p>
                <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
                    <FormField
                        label="Passing Score"
                        description="Minimum score to pass (%)"
                        error={errors.passingScore?.message}
                    >
                        <div className="flex items-center gap-2">
                            <Input
                                id="passingScore"
                                type="number"
                                min={0}
                                max={100}
                                className="w-24"
                                {...register("passingScore", {valueAsNumber: true})}
                                disabled={isPending}
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                        </div>
                    </FormField>

                    <FormField
                        label="Time Limit"
                        description="Optional. Leave blank for no limit."
                        error={errors.timeLimitMinutes?.message}
                    >
                        <div className="flex items-center gap-2">
                            <Input
                                id="timeLimitMinutes"
                                type="number"
                                min={1}
                                className="w-24"
                                {...register("timeLimitMinutes", {valueAsNumber: true})}
                                disabled={isPending}
                            />
                            <span className="text-sm text-muted-foreground">min</span>
                        </div>
                    </FormField>
                </div>
            </div>

            {/* Submit */}
            {!editMode && (
                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : submitLabel}
                    </Button>
                </div>
            )}
        </form>
    );
}

// Backward compatibility aliases
export const QuizLessonForm = QuizForm;
export const LessonForm = QuizForm;
