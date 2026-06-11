"use client";

import React, {useCallback, useImperativeHandle, useRef} from "react";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {FormField} from "@/components/learning-path/form-field";
import {
    DifficultyField,
    LessonFormActions,
    LessonFormHeader,
    LessonFormSection,
} from "@/components/learning-path/lesson-form-ui";
import {useLessonFormAutosave} from "@/hooks/use-lesson-form-autosave";
import {
    CreateQuizLessonSchema,
    EditQuizContentSchema,
    type QuizLessonDTO,
} from "@/types/learning-path/schema";

export type QuizSettingsFormHandle = {
    trigger: () => Promise<boolean>;
    submit: () => Promise<void>;
};

interface QuizSettingsFormProps {
    defaultValues?: Partial<QuizLessonDTO>;
    onSubmit: (data: QuizLessonDTO) => Promise<void>;
    isPending?: boolean;
    enableAutosave?: boolean;
    editMode?: boolean;
    submitLabel?: string;
    formRef?: React.RefObject<QuizSettingsFormHandle | null>;
}

export function QuizSettingsForm({
    defaultValues,
    onSubmit,
    isPending,
    enableAutosave = false,
    editMode = enableAutosave,
    submitLabel,
    formRef: externalFormRef,
}: QuizSettingsFormProps) {
    const t = useTranslations("lessonForm");
    const internalFormRef = useRef<QuizSettingsFormHandle | null>(null);
    const formRef = externalFormRef ?? internalFormRef;
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: {errors, isDirty},
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

    const difficulty = useWatch({control, name: "difficulty"});
    const passingScore = useWatch({control, name: "passingScore"}) ?? 70;
    const watchedData = useWatch({control});
    const save = useCallback(async () => {
        await handleSubmit(onSubmit)();
    }, [handleSubmit, onSubmit]);
    const autosave = useLessonFormAutosave({
        data: watchedData,
        isDirty,
        enabled: enableAutosave,
        onSave: save,
    });

    useImperativeHandle(formRef, () => ({
        trigger: async () => {
            let valid = false;
            await handleSubmit(() => {
                valid = true;
            })();
            return valid;
        },
        submit: save,
    }), [handleSubmit, save]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-7">
            <LessonFormHeader
                type="QUIZ"
                status={enableAutosave ? autosave.status : undefined}
                isDirty={isDirty}
                lastSavedAt={autosave.lastSavedAt}
            />

            <LessonFormSection title={t("details.title")} description={t("quiz.detailsDescription")}>
                <FormField label={t("fields.title")} error={errors.title?.message} required>
                    <Input
                        id="quiz-title"
                        placeholder={t("quiz.titlePlaceholder")}
                        className="max-w-2xl"
                        aria-invalid={!!errors.title}
                        disabled={isPending}
                        {...register("title")}
                    />
                </FormField>
                <DifficultyField
                    value={difficulty}
                    onChange={(value) => setValue("difficulty", value, {shouldValidate: true, shouldDirty: true})}
                    error={errors.difficulty?.message}
                    disabled={isPending}
                />
            </LessonFormSection>

            <LessonFormSection title={t("quiz.rulesTitle")} description={t("quiz.rulesDescription")}>
                <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
                    <FormField label={t("quiz.passingScore")} error={errors.passingScore?.message} description={t("quiz.passingDescription", {score: passingScore})}>
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
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary transition-[width]" style={{width: `${passingScore}%`}}/>
                        </div>
                    </FormField>
                    <FormField label={t("quiz.timeLimit")} error={errors.timeLimitMinutes?.message} description={t("quiz.timeDescription")}>
                        <div className="relative">
                            <Input
                                id="timeLimitMinutes"
                                type="number"
                                min={1}
                                max={300}
                                placeholder={t("quiz.noLimit")}
                                className="pr-12"
                                {...register("timeLimitMinutes", {valueAsNumber: true})}
                                disabled={isPending}
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">min</span>
                        </div>
                    </FormField>
                </div>
            </LessonFormSection>

            <LessonFormActions
                isPending={isPending}
                submitLabel={submitLabel ?? t(enableAutosave ? "actions.saveChanges" : "actions.createLesson")}
                autosave={enableAutosave}
            />
        </form>
    );
}
