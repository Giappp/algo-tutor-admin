"use client";

import {Control, Controller, UseFormRegister, UseFormSetValue} from "react-hook-form";
import {cn} from "@/lib/utils";
import {Input} from "@/components/ui/input";
import {FormField} from "@/components/learning-path/form-field";
import {MarkdownSplitEditor} from "@/components/ui/markdown-split-editor";
import {Difficulty} from "@/types/learning-path";
import {CodingLessonDTO} from "@/types/learning-path/schema";
import {DIFFICULTY_OPTIONS} from "../constants";

interface BasicInfoSectionProps {
    control: Control<CodingLessonDTO>;
    register: UseFormRegister<CodingLessonDTO>;
    setValue: UseFormSetValue<CodingLessonDTO>;
    errors: {
        title?: { message?: string };
        statement?: { message?: string };
        difficulty?: { message?: string };
    };
    watchedDifficulty?: Difficulty;
    isPending?: boolean;
}

export function BasicInfoSection({
    control,
    register,
    setValue,
    errors,
    watchedDifficulty,
    isPending,
}: BasicInfoSectionProps) {
    return (
        <div className="flex flex-col gap-6">
            <FormField
                label="Problem Title"
                error={errors.title?.message}
                required
                description="A clear, concise name for the problem"
            >
                <Input
                    id="title"
                    placeholder="e.g. Two Sum"
                    className="text-base h-11"
                    aria-invalid={!!errors.title}
                    disabled={isPending}
                    {...register("title")}
                />
            </FormField>

            <FormField label="Problem Statement" error={errors.statement?.message} required>
                <Controller
                    name="statement"
                    control={control}
                    render={({field}) => (
                        <MarkdownSplitEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Given an array of integers nums and an integer target..."
                            disabled={isPending}
                            minHeight="350px"
                        />
                    )}
                />
            </FormField>

            <FormField
                label="Difficulty"
                error={errors.difficulty?.message}
                description="How challenging is this problem for learners?"
            >
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
                                <span className="text-xs font-black tracking-widest">
                                    {opt.label.charAt(0)}
                                </span>
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            </FormField>
        </div>
    );
}
