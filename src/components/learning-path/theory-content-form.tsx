"use client";

import React, {useCallback, useImperativeHandle, useRef} from "react";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {FormField} from "@/components/learning-path/form-field";
import {
    DifficultyField,
    LessonFormActions,
    LessonFormHeader,
    LessonFormSection,
} from "@/components/learning-path/lesson-form-ui";
import {THEORY_TEMPLATES} from "@/components/learning-path/theory-templates";
import {MarkdownSplitEditor} from "@/components/ui/markdown-split-editor";
import {useLessonFormAutosave} from "@/hooks/use-lesson-form-autosave";
import {useGenerateLessonContent} from "@/hooks/use-admin-ai-lesson";
import {CreateTheoryLessonSchema, type TheoryLessonDTO} from "@/types/learning-path/schema";

export type TheoryContentFormHandle = {
    trigger: () => Promise<boolean>;
    submit: () => Promise<void>;
};

interface TheoryContentFormProps {
    defaultValues?: Partial<TheoryLessonDTO>;
    onSubmit: (data: TheoryLessonDTO) => Promise<void>;
    isPending?: boolean;
    enableAutosave?: boolean;
    submitLabel?: string;
    formRef?: React.RefObject<TheoryContentFormHandle | null>;
    lessonId?: number;
}

export function TheoryContentForm({
    defaultValues,
    onSubmit,
    isPending,
    enableAutosave = false,
    submitLabel,
    formRef: externalFormRef,
    lessonId,
}: TheoryContentFormProps) {
    const t = useTranslations("lessonForm");
    const internalFormRef = useRef<TheoryContentFormHandle | null>(null);
    const formRef = externalFormRef ?? internalFormRef;
    const aiMutation = useGenerateLessonContent(lessonId ?? 0, "THEORY");
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: {errors, isDirty},
    } = useForm<TheoryLessonDTO>({
        resolver: zodResolver(CreateTheoryLessonSchema),
        defaultValues: {
            type: "THEORY",
            title: "",
            content: "",
            estimatedMinutes: undefined,
            difficulty: undefined,
            displayOrder: undefined,
            ...defaultValues,
        },
    });

    const content = useWatch({control, name: "content"}) ?? "";
    const difficulty = useWatch({control, name: "difficulty"});
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

    const applyTemplate = (template: string) => {
        if (!content.trim() || window.confirm(t("theory.replaceTemplateConfirm"))) {
            setValue("content", template, {shouldValidate: true, shouldDirty: true});
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-7">
            <LessonFormHeader
                type="THEORY"
                status={enableAutosave ? autosave.status : undefined}
                isDirty={isDirty}
                lastSavedAt={autosave.lastSavedAt}
            />

            <LessonFormSection title={t("details.title")} description={t("details.description")}>
                <FormField label={t("fields.title")} error={errors.title?.message} required>
                    <Input
                        id="theory-title"
                        placeholder={t("theory.titlePlaceholder")}
                        aria-invalid={!!errors.title}
                        disabled={isPending}
                        className="max-w-2xl"
                        {...register("title")}
                    />
                </FormField>
                <DifficultyField
                    value={difficulty}
                    onChange={(value) => setValue("difficulty", value, {shouldValidate: true, shouldDirty: true})}
                    disabled={isPending}
                />
                <FormField
                    label={t("theory.estimatedMinutes")}
                    error={errors.estimatedMinutes?.message}
                    description={t("theory.estimatedMinutesDescription")}
                >
                    <Input
                        id="theory-estimated-minutes"
                        type="number"
                        min={1}
                        max={1440}
                        placeholder={t("theory.estimatedMinutesPlaceholder")}
                        disabled={isPending}
                        className="max-w-xs"
                        {...register("estimatedMinutes", {valueAsNumber: true})}
                    />
                </FormField>
            </LessonFormSection>

            <LessonFormSection
                title={t("theory.contentTitle")}
                description={t("theory.contentDescription")}
                aside={(
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {THEORY_TEMPLATES.map((template) => {
                            const Icon = template.icon;
                            return (
                                <Button
                                    key={template.id}
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={isPending}
                                    onClick={() => applyTemplate(template.content)}
                                    className="h-7 rounded-md px-2 text-xs"
                                    title={t(`theory.templates.${template.id}.description`)}
                                >
                                    <Icon className="size-3.5"/>
                                    {t(`theory.templates.${template.id}.label`)}
                                </Button>
                            );
                        })}
                    </div>
                )}
            >
                <FormField error={errors.content?.message}>
                    <MarkdownSplitEditor
                        value={content}
                        onChange={(value) => setValue("content", value, {shouldValidate: true, shouldDirty: true})}
                        placeholder={t("theory.contentPlaceholder")}
                        disabled={isPending}
                        minHeight="500px"
                        onAiGenerate={lessonId ? async ({prompt, content: currentContent, selection}) => {
                            const context = selection || currentContent;
                            const result = await aiMutation.mutateAsync({
                                prompt: [
                                    prompt,
                                    "",
                                    selection
                                        ? "Only rewrite or expand the selected Markdown excerpt below. Return the replacement as the lesson content."
                                        : "Revise the current Markdown lesson according to the request.",
                                    context.slice(0, 3000),
                                ].join("\n").slice(0, 5000),
                            });
                            return result.content.type === "THEORY" ? result.content.content : currentContent;
                        } : undefined}
                    />
                </FormField>
            </LessonFormSection>

            <LessonFormActions
                isPending={isPending}
                submitLabel={submitLabel ?? t(enableAutosave ? "actions.saveChanges" : "actions.createLesson")}
                autosave={enableAutosave}
            />
        </form>
    );
}
