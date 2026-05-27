"use client";

import {useCallback, useImperativeHandle, useRef} from "react";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {FileQuestion} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {FormField} from "@/components/learning-path/form-field";
import {EditQuizContentSchema, QuizLessonDTO} from "@/types/learning-path/schema";
import {Difficulty} from "@/types/learning-path";
import {SaveStatusIndicator} from "@/components/ui/save-status-indicator";
import {useAutosave} from "@/hooks/use-autosave";
import {useUnsavedChanges} from "@/hooks/use-unsaved-changes";
import {useKeyboardSave} from "@/hooks/use-keyboard-save";
import {toast} from "sonner";

const DIFFICULTY_OPTIONS: {
    value: Difficulty;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
}[] = [
    {value: "EASY", label: "Easy", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30"},
    {value: "MEDIUM", label: "Medium", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30"},
    {value: "HARD", label: "Hard", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/30"},
];

export type QuizSettingsFormHandle = {
    trigger: () => Promise<boolean>;
    submit: () => Promise<void>;
};

interface QuizSettingsFormProps {
    defaultValues?: Partial<QuizLessonDTO>;
    onSubmit: (data: QuizLessonDTO) => Promise<void>;
    isPending?: boolean;
    enableAutosave?: boolean;
    formRef?: React.RefObject<QuizSettingsFormHandle | null>;
}

/**
 * Quiz settings form for the edit page — only basic info + quiz settings.
 * Questions are managed in a separate tab.
 */
export function QuizSettingsForm({
    defaultValues,
    onSubmit,
    isPending,
    enableAutosave = false,
    formRef: externalFormRef,
}: QuizSettingsFormProps) {
    const internalFormRef = useRef<QuizSettingsFormHandle | null>(null);
    const formRef = externalFormRef ?? internalFormRef;

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: {errors, isDirty},
    } = useForm<QuizLessonDTO>({
        resolver: zodResolver(EditQuizContentSchema),
        defaultValues: {
            type: "QUIZ",
            title: "",
            difficulty: undefined,
            passingScore: 70,
            timeLimitMinutes: undefined,
            ...defaultValues,
        },
    });

    const watchedDifficulty = useWatch({control, name: "difficulty"});
    const watchedPassingScore = useWatch({control, name: "passingScore"});
    const watchedData = useWatch({control});

    // Autosave
    const handleAutoSave = useCallback(async () => {
        await handleSubmit(onSubmit)();
    }, [handleSubmit, onSubmit]);

    const {status, lastSavedAt, saveNow} = useAutosave({
        data: watchedData,
        onSave: handleAutoSave,
        delay: 5000,
        enabled: enableAutosave && isDirty,
    });

    useUnsavedChanges(isDirty);
    useKeyboardSave(saveNow, enableAutosave);

    useImperativeHandle(formRef, () => ({
        trigger: async () => {
            let valid = false;
            await handleSubmit(() => { valid = true; })();
            return valid;
        },
        submit: async () => {
            await handleSubmit(onSubmit)();
        },
    }));

    return (
        <form
            onSubmit={handleSubmit(onSubmit, (formErrors) => {
                const firstError = Object.values(formErrors).find(e => e?.message);
                if (firstError && "message" in firstError) {
                    toast.error(firstError.message as string);
                }
            })}
            className="flex flex-col gap-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
                        <FileQuestion className="w-5 h-5 text-amber-600 dark:text-amber-400"/>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold tracking-tight">Quiz Settings</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Basic information and quiz configuration
                        </p>
                    </div>
                </div>
                {enableAutosave && (
                    <SaveStatusIndicator
                        status={status}
                        isDirty={isDirty}
                        lastSavedAt={lastSavedAt}
                    />
                )}
            </div>

            {/* Basic Information */}
            <div className="flex flex-col gap-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Basic Information
                </h3>

                <FormField label="Quiz Title" error={errors.title?.message} required description="A clear name for the assessment">
                    <Input
                        id="title"
                        placeholder="e.g. Arrays Fundamentals Quiz"
                        className="text-sm h-11 max-w-2xl"
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
            <div className="flex flex-col gap-6 border-t pt-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Quiz Configuration
                </h3>

                <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
                    <FormField label="Passing Score" error={errors.passingScore?.message} description="Minimum percentage to pass">
                        <div className="relative">
                            <Input
                                id="passingScore"
                                type="number"
                                min={0}
                                max={100}
                                className="pr-10 text-sm h-11"
                                {...register("passingScore", {valueAsNumber: true})}
                                disabled={isPending}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">%</span>
                        </div>
                        <div className="mt-3">
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                                    style={{width: `${watchedPassingScore ?? 70}%`}}
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
                                {...register("timeLimitMinutes", {valueAsNumber: true})}
                                disabled={isPending}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">min</span>
                        </div>
                    </FormField>
                </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-6 border-t mt-4">
                {enableAutosave && (
                    <p className="text-sm text-muted-foreground">
                        Auto-saves after 5s of inactivity • <kbd className="px-2 py-0.5 rounded bg-muted border text-sm font-mono">Ctrl+S</kbd> to save immediately
                    </p>
                )}
                <Button type="submit" disabled={isPending} className="ml-auto text-sm h-10 px-5">
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
