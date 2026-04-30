"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import {useCallback, useState} from "react";
import {ChevronLeftIcon, ChevronRightIcon, Plus, Trash2} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel,} from "@/components/ui/field";
import {CreateLesson, CreateLessonSchema,} from "@/types/learning-path/schema";
import {LessonType} from "@/types/learning-path";
import {LessonTypeSelector} from "@/components/learning-path/lesson-type-selector";
import {StepIndicator} from "@/components/learning-path/step-indicator";

const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="h-48 rounded-xl border border-input bg-muted animate-pulse"/>
        ),
    }
);

interface LessonFormProps {
    defaultValues?: Partial<CreateLesson>;
    onSubmit: (data: CreateLesson) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    /** When provided, the form runs in controlled mode — the parent manages steps. */
    currentStep?: number;
    onStepChange?: (step: number) => void;
    /** When true, hides the internal step indicator and nav buttons (parent provides them). */
    externalStepControl?: boolean;
    /** Ref to the form's handleSubmit function so the parent can trigger it. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formRef?: React.MutableRefObject<any>;
}

// Steps for CODING lessons
const CODING_STEPS = [
    {id: "basic", label: "Basic Info", description: "Title & description"},
    {id: "setup", label: "Problem Setup", description: "Limits & constraints"},
    {id: "starter", label: "Starter Code", description: "Code templates"},
    {id: "examples", label: "Examples", description: "Test cases & hints"},
];

// Steps for QUIZ lessons
const QUIZ_STEPS = [
    {id: "basic", label: "Basic Info", description: "Title & content"},
    {id: "settings", label: "Quiz Settings", description: "Time & passing score"},
];

// Steps for THEORY lessons (single step)
const THEORY_STEPS = [
    {id: "content", label: "Content", description: "Write your lesson"},
];

const DIFFICULTY_OPTIONS = [
    {value: "EASY", label: "Easy", description: "For beginners"},
    {value: "MEDIUM", label: "Medium", description: "Moderate challenge"},
    {value: "HARD", label: "Hard", description: "Advanced topics"},
];

const LANGUAGE_STARTER_CODE: Record<string, Record<string, string>> = {
    THEORY: {},
    QUIZ: {},
    CODING: {
        JAVA: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // your code here\n        return new int[]{};\n    }\n}",
        PYTHON: "class Solution:\n    def two_sum(self, nums: list[int], target: int) -> list[int]:\n        # your code here\n        pass",
    },
};

export function LessonForm({
                               defaultValues,
                               onSubmit,
                               isPending,
                               submitLabel = "Save Lesson",
                               currentStep: externalStep,
                               onStepChange,
                               externalStepControl,
                               formRef,
                           }: LessonFormProps) {
    const [internalStep, setInternalStep] = useState(0);
    const currentStep = externalStepControl ? (externalStep ?? 0) : internalStep;
    const setCurrentStep = externalStepControl
        ? (onStepChange ?? (() => {}))
        : setInternalStep;
    // Type helper to allow functional updater in both modes
    const setStep = (value: number | ((prev: number) => number)) =>
        setCurrentStep(typeof value === "function" ? value(currentStep) : value);
    const [localLessonType, setLocalLessonType] = useState<LessonType>(
        defaultValues?.type ?? "THEORY"
    );

    const {
        register,
        handleSubmit: RHhandleSubmit,
        setValue,
        watch,
        trigger,
        formState: {errors},
    } = useForm<CreateLesson & Record<string, unknown>>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(CreateLessonSchema) as any,
        defaultValues: {
            type: "THEORY",
            title: "",
            content: "",
            difficulty: undefined,
            orderIndex: undefined,
            timeLimit: 2000,
            memoryLimit: 256,
            constraints: "",
            starterCode: {},
            hints: [],
            examples: [],
            keyInsights: [],
            passingScore: 70,
            timeLimitMinutes: undefined,
            ...defaultValues,
        },
    });

    // Expose handleSubmit to parent via formRef when in external mode
    if (formRef) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formRef.current = RHhandleSubmit(onSubmit as any);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = externalStepControl ? (() => {}) as any : RHhandleSubmit(onSubmit as any);

    const watchedHints = (watch("hints") ?? []) as string[];
    const watchedExamples = (watch("examples") ?? []) as { input: string; output: string; explanation: string }[];

    const getSteps = useCallback(() => {
        switch (localLessonType) {
            case "CODING":
                return CODING_STEPS;
            case "QUIZ":
                return QUIZ_STEPS;
            default:
                return THEORY_STEPS;
        }
    }, [localLessonType]);

    const steps = getSteps();
    const totalSteps = steps.length;

    const handleTypeChange = (type: LessonType) => {
        setLocalLessonType(type);
        setValue("type", type, {shouldValidate: true});
        setStep(0);
    };

    const handleNext = async () => {
        // Validate current step fields before proceeding
        let fieldsToValidate: string[] = [];
        if (currentStep === 0) {
            fieldsToValidate = ["title", "content"];
        } else if (localLessonType === "CODING" && currentStep === 1) {
            fieldsToValidate = ["timeLimit", "memoryLimit"];
        }

        const isValid = await trigger(fieldsToValidate as Parameters<typeof trigger>[0]);
        if (isValid && currentStep < totalSteps - 1) {
            setStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setStep(currentStep - 1);
        }
    };

    const addHint = () => setValue("hints", [...watchedHints, ""]);
    const removeHint = (index: number) =>
        setValue("hints", watchedHints.filter((_: string, i: number) => i !== index));

    const addExample = () =>
        setValue("examples", [
            ...watchedExamples,
            {input: "", output: "", explanation: ""},
        ]);
    const removeExample = (index: number) =>
        setValue("examples", watchedExamples.filter((_: {
            input: string;
            output: string;
            explanation: string
        }, i: number) => i !== index));

    const renderBasicInfoStep = () => (
        <>
            <LessonTypeSelector
                value={localLessonType}
                onChange={handleTypeChange}
                disabled={isPending}
            />

            {/* Difficulty */}
            <Field>
                <FieldLabel>Difficulty</FieldLabel>
                <FieldContent>
                    <div className="grid grid-cols-3 gap-3">
                        {DIFFICULTY_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() =>
                                    setValue("difficulty", opt.value as CreateLesson["difficulty"], {
                                        shouldValidate: true,
                                    })
                                }
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all",
                                    watch("difficulty") === opt.value
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                                )}
                            >
                                <span className="text-sm font-semibold">{opt.label}</span>
                                <span className="text-[10px] text-muted-foreground">{opt.description}</span>
                            </button>
                        ))}
                    </div>
                </FieldContent>
            </Field>

            {/* Title */}
            <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <FieldContent>
                    <Input
                        id="title"
                        placeholder="e.g. Introduction to Arrays"
                        aria-invalid={!!errors.title}
                        disabled={isPending}
                        {...register("title")}
                    />
                    {errors.title && (
                        <FieldError>{errors.title.message}</FieldError>
                    )}
                </FieldContent>
            </Field>

            {/* Content */}
            <Field>
                <FieldLabel htmlFor="content">
                    {localLessonType === "THEORY" ? "Lesson Content" : "Problem Description"}
                </FieldLabel>
                <FieldContent>
                    <Textarea
                        id="content"
                        placeholder={
                            localLessonType === "THEORY"
                                ? "Write lesson content in Markdown..."
                                : "Problem description in Markdown..."
                        }
                        className={localLessonType === "THEORY" ? "min-h-64" : "min-h-32"}
                        aria-invalid={!!errors.content}
                        disabled={isPending}
                        {...register("content")}
                    />
                    {errors.content && (
                        <FieldError>{errors.content.message}</FieldError>
                    )}
                </FieldContent>
            </Field>
        </>
    );

    const renderProblemSetupStep = () => (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="timeLimit">Time Limit (ms)</FieldLabel>
                    <FieldContent>
                        <Input
                            id="timeLimit"
                            type="number"
                            min={1}
                            max={300000}
                            {...register("timeLimit", {valueAsNumber: true})}
                            disabled={isPending}
                        />
                    </FieldContent>
                </Field>

                <Field>
                    <FieldLabel htmlFor="memoryLimit">Memory Limit (MB)</FieldLabel>
                    <FieldContent>
                        <Input
                            id="memoryLimit"
                            type="number"
                            min={1}
                            max={1024}
                            {...register("memoryLimit", {valueAsNumber: true})}
                            disabled={isPending}
                        />
                    </FieldContent>
                </Field>
            </div>

            <Field>
                <FieldLabel htmlFor="constraints">Constraints</FieldLabel>
                <FieldContent>
                    <Textarea
                        id="constraints"
                        placeholder={"2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9"}
                        className="min-h-20 font-mono text-sm"
                        disabled={isPending}
                        {...register("constraints")}
                    />
                    <FieldDescription>Newline-separated constraints.</FieldDescription>
                </FieldContent>
            </Field>
        </>
    );

    const renderStarterCodeStep = () => (
        <>
            {["JAVA", "PYTHON"].map((lang) => (
                <Field key={lang}>
                    <FieldLabel>{lang} Starter Code</FieldLabel>
                    <FieldContent className="gap-1">
                        <Textarea className="hidden" {...register(`starterCode.${lang}` as const)} />
                        <div className="rounded-xl border border-input overflow-hidden">
                            <MonacoEditor
                                height="200px"
                                language={lang.toLowerCase()}
                                value={(watch("starterCode") as Record<string, string>)?.[lang] ?? LANGUAGE_STARTER_CODE.CODING[lang] ?? ""}
                                onChange={(val) =>
                                    setValue(
                                        `starterCode.${lang}` as const,
                                        val ?? "",
                                        {shouldValidate: true}
                                    )
                                }
                                theme="vs-dark"
                                options={{
                                    minimap: {enabled: false},
                                    fontSize: 13,
                                    lineNumbers: "on",
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 4,
                                }}
                            />
                        </div>
                    </FieldContent>
                </Field>
            ))}
        </>
    );

    const renderExamplesStep = () => (
        <>
            {/* Examples */}
            <Field>
                <FieldLabel>Examples</FieldLabel>
                <FieldContent className="gap-3">
                    {watchedExamples.map((ex, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-border/50 bg-muted/20 p-3"
                        >
                            <div className="grid gap-2 sm:grid-cols-2">
                                <div>
                                    <FieldLabel className="text-xs">Input</FieldLabel>
                                    <Textarea
                                        placeholder="[2,7,11,15], target=9"
                                        className="font-mono text-sm min-h-12"
                                        {...register(`examples.${i}.input` as const)}
                                        disabled={isPending}
                                    />
                                </div>
                                <div>
                                    <FieldLabel className="text-xs">Output</FieldLabel>
                                    <Textarea
                                        placeholder="[0,1]"
                                        className="font-mono text-sm min-h-12"
                                        {...register(`examples.${i}.output` as const)}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                            <div className="mt-2">
                                <FieldLabel className="text-xs">Explanation</FieldLabel>
                                <Input
                                    placeholder="Explanation (optional)"
                                    {...register(`examples.${i}.explanation` as const)}
                                    disabled={isPending}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => removeExample(i)}
                                className="mt-2"
                            >
                                <Trash2 data-icon="inline-start"/>
                                Remove
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExample}
                    >
                        <Plus data-icon="inline-start"/>
                        Add Example
                    </Button>
                </FieldContent>
            </Field>

            {/* Hints */}
            <Field>
                <FieldLabel>Hints</FieldLabel>
                <FieldContent className="gap-3">
                    {watchedHints.map((hint, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input
                                placeholder={`Hint ${i + 1}`}
                                {...register(`hints.${i}` as const)}
                                disabled={isPending}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => removeHint(i)}
                            >
                                <Trash2 data-icon="inline-start"/>
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addHint}
                    >
                        <Plus data-icon="inline-start"/>
                        Add Hint
                    </Button>
                </FieldContent>
            </Field>
        </>
    );

    const renderQuizSettingsStep = () => (
        <div className="grid gap-4 sm:grid-cols-2">
            <Field>
                <FieldLabel htmlFor="passingScore">Passing Score (%)</FieldLabel>
                <FieldContent>
                    <Input
                        id="passingScore"
                        type="number"
                        min={0}
                        max={100}
                        {...register("passingScore", {valueAsNumber: true})}
                        disabled={isPending}
                    />
                </FieldContent>
            </Field>

            <Field>
                <FieldLabel htmlFor="timeLimitMinutes">Time Limit (minutes)</FieldLabel>
                <FieldContent>
                    <Input
                        id="timeLimitMinutes"
                        type="number"
                        min={1}
                        {...register("timeLimitMinutes", {valueAsNumber: true})}
                        disabled={isPending}
                    />
                    <FieldDescription>Optional. Leave blank for no limit.</FieldDescription>
                </FieldContent>
            </Field>
        </div>
    );

    const renderCurrentStep = () => {
        if (localLessonType === "CODING") {
            switch (currentStep) {
                case 0:
                    return renderBasicInfoStep();
                case 1:
                    return renderProblemSetupStep();
                case 2:
                    return renderStarterCodeStep();
                case 3:
                    return renderExamplesStep();
                default:
                    return null;
            }
        }

        if (localLessonType === "QUIZ") {
            switch (currentStep) {
                case 0:
                    return renderBasicInfoStep();
                case 1:
                    return renderQuizSettingsStep();
                default:
                    return null;
            }
        }

        // THEORY - single step
        return renderBasicInfoStep();
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Step Indicator (only show if multiple steps AND not externally controlled) */}
            {totalSteps > 1 && !externalStepControl && (
                <StepIndicator
                    steps={steps}
                    currentStep={currentStep}
                    onStepClick={(index) => {
                        if (index <= currentStep) {
                            setStep(index);
                        }
                    }}
                />
            )}

            <form
                onSubmit={
                    externalStepControl
                        ? undefined
                        : handleSubmit as React.FormEventHandler<HTMLFormElement>
                }
                className="flex flex-col gap-6"
            >
                <FieldGroup className="gap-5">
                    {renderCurrentStep()}
                </FieldGroup>

                {/* Navigation Buttons — hidden when parent controls steps */}
                {!externalStepControl && (
                    <div className="flex justify-between gap-3 pt-2">
                        <div>
                            {currentStep > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrevious}
                                >
                                    <ChevronLeftIcon data-icon="inline-start"/>
                                    Previous
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {currentStep < totalSteps - 1 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                >
                                    Next
                                    <ChevronRightIcon data-icon="inline-end"/>
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? "Saving..." : submitLabel}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
