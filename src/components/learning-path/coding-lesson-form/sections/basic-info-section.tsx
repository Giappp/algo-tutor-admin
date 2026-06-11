"use client";

import {Control, Controller, UseFormRegister, UseFormSetValue} from "react-hook-form";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {FormField} from "@/components/learning-path/form-field";
import {DifficultyField} from "@/components/learning-path/lesson-form-ui";
import {MarkdownSplitEditor} from "@/components/ui/markdown-split-editor";
import {Difficulty} from "@/types/learning-path";
import {CodingLessonDTO} from "@/types/learning-path/schema";

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
    const t = useTranslations("lessonForm");

    return (
        <div className="flex flex-col gap-6">
            <FormField
                label={t("coding.problemTitle")}
                error={errors.title?.message}
                required
                description={t("coding.problemTitleDescription")}
            >
                <Input
                    id="title"
                    placeholder={t("coding.problemTitlePlaceholder")}
                    className="text-base h-11"
                    aria-invalid={!!errors.title}
                    disabled={isPending}
                    {...register("title")}
                />
            </FormField>

            <FormField label={t("coding.statement")} error={errors.statement?.message} required>
                <Controller
                    name="statement"
                    control={control}
                    render={({field}) => (
                        <MarkdownSplitEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t("coding.statementPlaceholder")}
                            disabled={isPending}
                            minHeight="350px"
                        />
                    )}
                />
            </FormField>

            <DifficultyField
                value={watchedDifficulty}
                onChange={(value) => setValue("difficulty", value as Difficulty, {shouldValidate: true, shouldDirty: true})}
                error={errors.difficulty?.message}
                disabled={isPending}
            />
        </div>
    );
}
