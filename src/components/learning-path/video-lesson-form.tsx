"use client";

import React, {useCallback, useImperativeHandle, useRef} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useTranslations} from "next-intl";
import {useForm, useWatch} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {FormField} from "@/components/learning-path/form-field";
import {
    DifficultyField,
    LessonFormActions,
    LessonFormHeader,
    LessonFormSection,
} from "@/components/learning-path/lesson-form-ui";
import {CreateVideoLessonSchema, type VideoLessonDTO} from "@/types/learning-path/schema";

export type VideoLessonFormHandle = {
    trigger: () => Promise<boolean>;
    submit: () => Promise<void>;
};

interface VideoLessonFormProps {
    defaultValues?: Partial<VideoLessonDTO>;
    onSubmit: (data: VideoLessonDTO) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    formRef?: React.RefObject<VideoLessonFormHandle | null>;
}

export function VideoLessonForm({
    defaultValues,
    onSubmit,
    isPending,
    submitLabel,
    formRef: externalFormRef,
}: VideoLessonFormProps) {
    const t = useTranslations("lessonForm.video");
    const internalFormRef = useRef<VideoLessonFormHandle | null>(null);
    const formRef = externalFormRef ?? internalFormRef;
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: {errors},
    } = useForm<VideoLessonDTO>({
        resolver: zodResolver(CreateVideoLessonSchema),
        defaultValues: {
            type: "VIDEO",
            title: "",
            description: "",
            difficulty: undefined,
            ...defaultValues,
        },
    });
    const difficulty = useWatch({control, name: "difficulty"});
    const save = useCallback(async () => {
        await handleSubmit(onSubmit)();
    }, [handleSubmit, onSubmit]);

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
            <LessonFormHeader type="VIDEO"/>
            <LessonFormSection
                title={t("detailsTitle")}
                description={t("detailsDescription")}
            >
                <FormField label={t("title")} error={errors.title?.message} required>
                    <Input
                        id="video-title"
                        placeholder={t("titlePlaceholder")}
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
                <FormField label={t("description")} error={errors.description?.message}>
                    <Textarea
                        id="video-description"
                        placeholder={t("descriptionPlaceholder")}
                        aria-invalid={!!errors.description}
                        disabled={isPending}
                        className="max-w-3xl"
                        {...register("description")}
                    />
                </FormField>
            </LessonFormSection>
            <LessonFormActions isPending={isPending} submitLabel={submitLabel ?? t("createAction")}/>
        </form>
    );
}
