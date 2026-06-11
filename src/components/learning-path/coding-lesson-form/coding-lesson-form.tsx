"use client";

import React, {useCallback, useImperativeHandle, useRef, useState} from "react";
import {useFieldArray, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useTranslations} from "next-intl";
import {TooltipProvider} from "@/components/ui/tooltip";
import {CodingLessonDTO, CreateCodingLessonSchema, EditCodingContentSchema} from "@/types/learning-path/schema";
import {CodingTemplatePicker} from "@/components/learning-path/coding-template-picker";
import {ProblemTemplate} from "@/components/learning-path/coding-problem-templates";
import {LessonFormActions, LessonFormHeader} from "@/components/learning-path/lesson-form-ui";
import {useLessonFormAutosave} from "@/hooks/use-lesson-form-autosave";
import {SectionCard} from "./section-card";
import {DEFAULT_STARTER_CODE, STARTER_CODE_LANGUAGES} from "./constants";
import {
    BasicInfoSection,
    ConstraintsSection,
    ExamplesSection,
    HintsSection,
    StarterCodeSection,
} from "./sections";

export type CodingLessonFormHandle = {
    trigger: () => Promise<boolean>;
    submit: () => Promise<void>;
};

interface CodingLessonFormProps {
    defaultValues?: Partial<CodingLessonDTO>;
    onSubmit: (data: CodingLessonDTO) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    enableAutosave?: boolean;
    formRef?: React.RefObject<CodingLessonFormHandle | null>;
}

export function CodingLessonForm({
    defaultValues,
    onSubmit,
    isPending,
    submitLabel,
    enableAutosave = false,
    formRef: externalFormRef,
}: CodingLessonFormProps) {
    const t = useTranslations("lessonForm");
    const internalFormRef = useRef<CodingLessonFormHandle | null>(null);
    const formRef = externalFormRef ?? internalFormRef;

    const [activeSection, setActiveSection] = useState<string>("basic");

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: {errors, isDirty},
    } = useForm<CodingLessonDTO>({
        resolver: zodResolver(enableAutosave ? EditCodingContentSchema : CreateCodingLessonSchema),
        defaultValues: {
            type: "CODING",
            title: "",
            statement: "",
            baseTimeLimitMs: 2000,
            baseMemoryLimitMb: 256,
            constraints: [],
            starterCode: {...DEFAULT_STARTER_CODE},
            hints: [],
            examples: [],
            ...defaultValues,
        },
    });

    const watchedDifficulty = useWatch({control, name: "difficulty"});
    const constraints = useWatch({control, name: "constraints"}) || [];
    const hints = useWatch({control, name: "hints"}) || [];
    const watchedData = useWatch({control});

    // --- Constraint handlers ---
    const handleAddConstraint = () => {
        if (constraints.length >= 10) return;
        setValue("constraints", [...constraints, ""], {shouldValidate: true, shouldDirty: true});
    };

    const handleRemoveConstraint = (index: number) => {
        setValue("constraints", constraints.filter((_, i) => i !== index), {shouldValidate: true, shouldDirty: true});
    };

    const handleUpdateConstraint = (index: number, value: string) => {
        const updated = [...constraints];
        updated[index] = value;
        setValue("constraints", updated, {shouldValidate: true});
    };

    // --- Hint handlers ---
    const handleAddHint = () => {
        if (hints.length >= 10) return;
        setValue("hints", [...hints, ""], {shouldValidate: true, shouldDirty: true});
    };

    const handleRemoveHint = (index: number) => {
        setValue("hints", hints.filter((_, i) => i !== index), {shouldValidate: true, shouldDirty: true});
    };

    const handleUpdateHint = (index: number, value: string) => {
        const updated = [...hints];
        updated[index] = value;
        setValue("hints", updated, {shouldValidate: true});
    };

    // --- Field arrays ---
    const {
        fields: exampleFields,
        append: appendExample,
        remove: removeExample,
    } = useFieldArray({control, name: "examples"});

    // --- Template ---
    const handleApplyTemplate = (template: ProblemTemplate) => {
        setValue("statement", template.statement, {shouldValidate: true});
        setValue("constraints", template.constraints, {shouldValidate: true});
        setValue("hints", template.hints, {shouldValidate: true});
        template.examples.forEach((ex, i) => {
            if (i < exampleFields.length) {
                setValue(`examples.${i}.input`, ex.input);
                setValue(`examples.${i}.output`, ex.output);
                setValue(`examples.${i}.explanation`, ex.explanation);
            } else {
                appendExample(ex);
            }
        });
    };

    // --- Imperative handle ---
    const buildFinalData = (data: CodingLessonDTO): CodingLessonDTO => ({
        ...data,
        type: "CODING" as const,
        starterCode: {
            java: data.starterCode?.java ?? DEFAULT_STARTER_CODE["java"],
            python: data.starterCode?.python ?? DEFAULT_STARTER_CODE["python"],
            cpp: data.starterCode?.cpp ?? DEFAULT_STARTER_CODE["cpp"],
        },
    });

    const save = useCallback(async () => {
        await handleSubmit(async (data) => {
            await onSubmit(buildFinalData(data));
        })();
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
            await handleSubmit(() => { valid = true; })();
            return valid;
        },
        submit: save,
    }), [handleSubmit, save]);

    // --- Section toggle ---
    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? "" : section);
    };

    const isOpen = (section: string) => activeSection === section;

    return (
        <TooltipProvider>
            <form
                onSubmit={handleSubmit(async (data) => {
                    await onSubmit(buildFinalData(data));
                })}
                className="flex w-full flex-col gap-7"
            >
                <LessonFormHeader
                    type="CODING"
                    status={enableAutosave ? autosave.status : undefined}
                    isDirty={isDirty}
                    lastSavedAt={autosave.lastSavedAt}
                    action={<CodingTemplatePicker onSelect={handleApplyTemplate} disabled={isPending}/>}
                />

                {/* Sections */}
                <div className="flex flex-col gap-3">
                    <SectionCard
                        number="01"
                        title={t("coding.sections.basic")}
                        badge={watchedDifficulty ? 1 : undefined}
                        isOpen={isOpen("basic")}
                        onToggle={() => toggleSection("basic")}
                    >
                        <BasicInfoSection
                            control={control}
                            register={register}
                            setValue={setValue}
                            errors={errors}
                            watchedDifficulty={watchedDifficulty}
                            isPending={isPending}
                        />
                    </SectionCard>

                    <SectionCard
                        number="02"
                        title={t("coding.sections.constraints")}
                        badge={constraints.length > 0 ? constraints.length : undefined}
                        isOpen={isOpen("constraints")}
                        onToggle={() => toggleSection("constraints")}
                    >
                        <ConstraintsSection
                            register={register}
                            constraints={constraints}
                            errors={errors}
                            onAdd={handleAddConstraint}
                            onRemove={handleRemoveConstraint}
                            onUpdate={handleUpdateConstraint}
                            isPending={isPending}
                        />
                    </SectionCard>

                    <SectionCard
                        number="03"
                        title={t("coding.sections.examples")}
                        badge={exampleFields.length > 0 ? exampleFields.length : undefined}
                        isOpen={isOpen("examples")}
                        onToggle={() => toggleSection("examples")}
                    >
                        <ExamplesSection
                            register={register}
                            fields={exampleFields}
                            onAppend={() => appendExample({input: "", output: "", explanation: ""})}
                            onRemove={removeExample}
                            isPending={isPending}
                        />
                    </SectionCard>

                    <SectionCard
                        number="04"
                        title={t("coding.sections.hints")}
                        badge={hints.length > 0 ? hints.length : undefined}
                        isOpen={isOpen("hints")}
                        onToggle={() => toggleSection("hints")}
                    >
                        <HintsSection
                            hints={hints}
                            onAdd={handleAddHint}
                            onRemove={handleRemoveHint}
                            onUpdate={handleUpdateHint}
                            isPending={isPending}
                        />
                    </SectionCard>

                    <SectionCard
                        number="05"
                        title={t("coding.sections.starterCode")}
                        badge={STARTER_CODE_LANGUAGES.length}
                        isOpen={isOpen("starter")}
                        onToggle={() => toggleSection("starter")}
                    >
                        <StarterCodeSection control={control} isPending={isPending}/>
                    </SectionCard>
                </div>

                <LessonFormActions
                    isPending={isPending}
                    submitLabel={submitLabel ?? t(enableAutosave ? "actions.saveChanges" : "actions.createLesson")}
                    autosave={enableAutosave}
                />
            </form>
        </TooltipProvider>
    );
}
