"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {BookOpenIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {FormField} from "@/components/learning-path/form-field";
import {CreateTheoryLesson, CreateTheoryLessonSchema} from "@/types/learning-path/schema";
import {RichTextEditorWithTemplates} from "@/components/ui/rich-text-editor";

const DIFFICULTY_OPTIONS = [
    {
        value: "EASY" as const,
        label: "Easy",
        description: "Beginner-friendly",
        color: "text-emerald-600 dark:text-emerald-400",
    },
    {
        value: "MEDIUM" as const,
        label: "Medium",
        description: "Moderate",
        color: "text-amber-600 dark:text-amber-400",
    },
    {
        value: "HARD" as const,
        label: "Hard",
        description: "Advanced",
        color: "text-red-600 dark:text-red-400",
    },
];

type TheoryFormHandle = {
    submit: () => Promise<void>;
};

interface TheoryFormProps {
    defaultValues?: Partial<CreateTheoryLesson>;
    onSubmit: (data: CreateTheoryLesson) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    editMode?: boolean;
    formRef?: React.RefObject<TheoryFormHandle | null>;
}

export function TheoryForm({
                               defaultValues,
                               onSubmit,
                               isPending,
                               submitLabel = "Create Lesson",
                               editMode,
                               formRef,
                           }: TheoryFormProps) {
    const {
        register,
        handleSubmit: RHhandleSubmit,
        setValue,
        watch,
        formState: {errors},
    } = useForm<CreateTheoryLesson>({
        resolver: zodResolver(CreateTheoryLessonSchema),
        defaultValues: {
            type: "THEORY",
            title: "",
            content: "",
            difficulty: undefined,
            orderIndex: undefined,
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
        <form id="theory-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-7 rounded-md bg-blue-500/10">
                    <BookOpenIcon className="size-4 text-blue-600 dark:text-blue-400"/>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Theory Lesson
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
                    placeholder="e.g. Introduction to Binary Search"
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
                                <span className={cn(isSelected ? "text-primary-foreground" : opt.color, "text-xs font-semibold")}>
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
                label="Content"
                error={errors.content?.message}
                description="Click a template below to get started, then customize the content."
            >
                <RichTextEditorWithTemplates
                    value={watchedContent}
                    onChange={(val) => setValue("content", val, {shouldValidate: true})}
                    placeholder="Write your lesson content..."
                    disabled={isPending}
                />
            </FormField>

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
