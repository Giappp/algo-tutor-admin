"use client";

import React, {useImperativeHandle, useRef, useState} from "react";
import {useFieldArray, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FileCode2, Loader2, Save} from "lucide-react";
import {Button} from "@/components/ui/button";
import {TooltipProvider} from "@/components/ui/tooltip";
import {CodingLessonDTO, CreateCodingLessonSchema} from "@/types/learning-path/schema";
import {CodingTemplatePicker} from "@/components/learning-path/coding-template-picker";
import {ProblemTemplate} from "@/components/learning-path/coding-problem-templates";
import {SectionCard} from "./section-card";
import {DEFAULT_STARTER_CODE} from "./constants";
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
    formRef?: React.RefObject<CodingLessonFormHandle | null>;
}

export function CodingLessonForm({
    defaultValues,
    onSubmit,
    isPending,
    submitLabel = "Create Lesson",
    formRef: externalFormRef,
}: CodingLessonFormProps) {
    const internalFormRef = useRef<CodingLessonFormHandle | null>(null);
    const formRef = externalFormRef ?? internalFormRef;

    const [activeSection, setActiveSection] = useState<string>("basic");

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: {errors},
    } = useForm<CodingLessonDTO>({
        resolver: zodResolver(CreateCodingLessonSchema),
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
        },
    });

    useImperativeHandle(formRef, () => ({
        trigger: async () => {
            let valid = false;
            await handleSubmit(() => { valid = true; })();
            return valid;
        },
        submit: async () => {
            await handleSubmit(async (data) => {
                await onSubmit(buildFinalData(data));
            })();
        },
    }));

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
                className="flex flex-col gap-8"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20">
                            <FileCode2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400"/>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold tracking-tight">Coding Challenge</h2>
                            <p className="text-sm text-muted-foreground">
                                Build a programming problem with test cases, starter code, and examples
                            </p>
                        </div>
                    </div>
                    <CodingTemplatePicker onSelect={handleApplyTemplate} disabled={isPending}/>
                </div>

                {/* Sections */}
                <div className="flex flex-col gap-3">
                    <SectionCard
                        number="01"
                        title="Basic Information"
                        color="indigo"
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
                        title="Constraints &amp; Limits"
                        color="amber"
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
                        title="Examples"
                        color="cyan"
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
                        title="Hints"
                        color="violet"
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
                        title="Starter Code"
                        color="emerald"
                        isOpen={isOpen("starter")}
                        onToggle={() => toggleSection("starter")}
                    >
                        <StarterCodeSection control={control} isPending={isPending}/>
                    </SectionCard>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-6 border-t">
                    <Button type="submit" disabled={isPending} size="lg" className="px-8 gap-2">
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin"/>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4"/>
                                {submitLabel}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </TooltipProvider>
    );
}
