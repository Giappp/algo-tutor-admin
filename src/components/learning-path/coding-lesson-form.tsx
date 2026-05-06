"use client";

import React, {useEffect, useImperativeHandle, useRef, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {FormField} from "@/components/learning-path/form-field";
import {RichTextEditorWithPreview} from "@/components/ui/rich-text-editor";
import type {CreateCodingLesson} from "@/types/learning-path/schema";
import {CreateCodingLessonSchema} from "@/types/learning-path/schema";
import {Difficulty} from "@/types/learning-path";

const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="h-40 rounded-xl border border-input bg-muted animate-pulse"/>
        ),
    }
);

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string; bgColor: string; borderColor: string }[] = [
    {
        value: "EASY",
        label: "Easy",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
    },
    {
        value: "MEDIUM",
        label: "Medium",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
    },
    {
        value: "HARD",
        label: "Hard",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
    },
];

const DEFAULT_STARTER_CODE: Record<string, string> = {
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // TODO: implement your solution
        return new int[] {};
    }
}`,
    python: `class Solution:
    def two_sum(self, nums: list[int], target: int) -> list[int]:
        # TODO: implement your solution
        pass`,
};

const LANGUAGE_CONFIG: Record<string, { label: string; monacoLanguage: string; badgeClass: string; badgeBg: string }> = {
    java: {
        label: "Java",
        monacoLanguage: "java",
        badgeClass: "text-orange-600 dark:text-orange-400",
        badgeBg: "bg-orange-500/10",
    },
    python: {
        label: "Python",
        monacoLanguage: "python",
        badgeClass: "text-blue-600 dark:text-blue-400",
        badgeBg: "bg-blue-500/10",
    },
};

type CodingLessonFormHandle = {
    trigger: () => Promise<boolean>;
    submit: () => Promise<void>;
};

export type {CodingLessonFormHandle};

interface CodingLessonFormProps {
    defaultValues?: Partial<CreateCodingLesson>;
    onSubmit: (data: CreateCodingLesson) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    editMode?: boolean;
    formRef?: React.RefObject<CodingLessonFormHandle | null>;
}

export function CodingLessonForm({
                                     defaultValues,
                                     onSubmit,
                                     isPending,
                                     submitLabel = "Create Lesson",
                                     editMode,
                                     formRef: externalFormRef,
                                 }: CodingLessonFormProps) {
    const internalFormRef = useRef<CodingLessonFormHandle | null>(null);
    const formRef = externalFormRef ?? internalFormRef;

    const [activeSection, setActiveSection] = useState<string>("basic");
    const [statementHtml, setStatementHtml] = useState("");

    interface TestCaseInput {
        stdin: string;
        expectedStdout: string;
        isHidden: boolean;
        explanation: string;
    }

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: {errors},
    } = useForm<CreateCodingLesson>({
        resolver: zodResolver(CreateCodingLessonSchema),
        defaultValues: {
            type: "CODING",
            title: "",
            difficulty: undefined,
            statement: "",
            baseTimeLimitMs: 2000,
            baseMemoryLimitMb: 256,
            constraints: [],
            starterCode: {...DEFAULT_STARTER_CODE},
            hints: [],
            examples: [],
            testCases: [],
            ...defaultValues,
        },
    });

    const watchedHints = watch("hints") ?? [];
    const watchedExamples = watch("examples") ?? [];
    const watchedStarterCode = watch("starterCode") ?? {};
    const watchedDifficulty = watch("difficulty");
    const watchedConstraints = watch("constraints") ?? [];
    const watchedTestCases = watch("testCases") as unknown as TestCaseInput[] ?? [];

    useEffect(() => {
        if (defaultValues) {
            const processedDefaults = {
                type: "CODING" as const,
                title: defaultValues.title ?? "",
                difficulty: defaultValues.difficulty,
                statement: defaultValues.statement ?? "",
                baseTimeLimitMs: defaultValues.baseTimeLimitMs ?? 2000,
                baseMemoryLimitMb: defaultValues.baseMemoryLimitMb ?? 256,
                constraints: defaultValues.constraints ?? [],
                starterCode: defaultValues.starterCode ?? {...DEFAULT_STARTER_CODE},
                hints: defaultValues.hints ?? [],
                examples: defaultValues.examples ?? [],
                testCases: (defaultValues.testCases ?? []) as unknown as TestCaseInput[],
            };
            reset(processedDefaults);
            setStatementHtml(defaultValues.statement ?? "");
        }
    }, [defaultValues, reset]);

    useEffect(() => {
        if (statementHtml !== undefined) {
            setValue("statement", statementHtml);
        }
    }, [statementHtml, setValue]);

    const addConstraint = () => {
        const current = watchedConstraints || [];
        setValue("constraints", [...current, ""]);
    };

    const removeConstraint = (index: number) => {
        const current = watchedConstraints || [];
        setValue("constraints", current.filter((_, i) => i !== index));
    };

    const updateConstraint = (index: number, value: string) => {
        const current = [...(watchedConstraints || [])];
        current[index] = value;
        setValue("constraints", current);
    };

    const addHint = () => {
        const current = watchedHints || [];
        setValue("hints", [...current, ""]);
    };

    const removeHint = (index: number) => {
        const current = watchedHints || [];
        setValue("hints", current.filter((_, i) => i !== index));
    };

    const addExample = () => {
        const current = watchedExamples || [];
        setValue("examples", [...current, {input: "", output: "", explanation: ""}]);
    };

    const removeExample = (index: number) => {
        const current = watchedExamples || [];
        setValue("examples", current.filter((_, i) => i !== index));
    };

    const addTestCase = () => {
        const current = (watchedTestCases || []) as TestCaseInput[];
        setValue("testCases" as const, [...current, {
            stdin: "",
            expectedStdout: "",
            isHidden: false,
            explanation: "",
        }]);
    };

    const removeTestCase = (index: number) => {
        const current = [...((watchedTestCases || []) as TestCaseInput[])];
        current.splice(index, 1);
        setValue("testCases" as const, current);
    };

    const updateTestCase = (index: number, field: keyof TestCaseInput, value: string | boolean) => {
        const current = [...((watchedTestCases || []) as TestCaseInput[])];
        current[index] = {...current[index], [field]: value};
        setValue("testCases" as const, current);
    };

    useImperativeHandle(formRef, () => ({
        trigger: async () => {
            let valid = false;
            await handleSubmit(() => { valid = true; })();
            return valid;
        },
        submit: async () => {
            await handleSubmit(async (data) => {
                const finalData = {
                    ...data,
                    type: "CODING" as const,
                    statement: statementHtml,
                    starterCode: {
                        java: watchedStarterCode["java"] ?? DEFAULT_STARTER_CODE["java"],
                        python: watchedStarterCode["python"] ?? DEFAULT_STARTER_CODE["python"],
                    },
                };
                await onSubmit(finalData);
            })();
        },
    }));

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? "" : section);
    };

    const isOpen = (section: string) => activeSection === section;

    const testCaseList = (watchedTestCases || []) as TestCaseInput[];

    return (
        <TooltipProvider>
            <form
                onSubmit={handleSubmit(async (data) => {
                    const finalData = {
                        ...data,
                        type: "CODING" as const,
                        statement: statementHtml,
                        starterCode: {
                            java: watchedStarterCode["java"] ?? DEFAULT_STARTER_CODE["java"],
                            python: watchedStarterCode["python"] ?? DEFAULT_STARTER_CODE["python"],
                        },
                    };
                    await onSubmit(finalData);
                })}
                className="flex flex-col gap-8"
            >
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-emerald-600 dark:text-emerald-400">
                            <path d="M8 3H7a2 2 0 0 0-2 2v5m6-7h1a2 2 0 0 1 2 2v5m-4-7v2m0 4h.01M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight">Coding Challenge</h2>
                        <p className="text-sm text-muted-foreground">Build a programming problem with test cases, starter code, and examples</p>
                    </div>
                </div>

                {/* SECTIONS */}
                <div className="flex flex-col gap-3">

                    {/* ── 01 Basic Information ── */}
                    <SectionCard
                        number="01"
                        title="Basic Information"
                        color="indigo"
                        badge={watchedDifficulty ? 1 : undefined}
                        isOpen={isOpen("basic")}
                        onToggle={() => toggleSection("basic")}
                    >
                        <div className="flex flex-col gap-6">
                            <FormField label="Problem Title" error={errors.title?.message} required
                                description="A clear, concise name for the problem">
                                <Input
                                    id="title"
                                    placeholder="e.g. Two Sum"
                                    className="text-base h-11"
                                    aria-invalid={!!errors.title}
                                    disabled={isPending}
                                    {...register("title")}
                                />
                            </FormField>

                            <FormField
                                label="Problem Statement"
                                error={errors.statement?.message}
                                required
                                description="Describe the problem clearly. You can use rich formatting: headings, bold, code blocks, lists."
                            >
                                <RichTextEditorWithPreview
                                    value={statementHtml}
                                    onChange={setStatementHtml}
                                    placeholder={"Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution."}
                                    disabled={isPending}
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
                                                <span className="text-xs font-black tracking-widest">{opt.label.charAt(0)}</span>
                                                <span>{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </FormField>
                        </div>
                    </SectionCard>

                    {/* ── 02 Constraints & Limits ── */}
                    <SectionCard
                        number="02"
                        title="Constraints &amp; Limits"
                        color="amber"
                        badge={watchedConstraints.length > 0 ? watchedConstraints.length : undefined}
                        isOpen={isOpen("constraints")}
                        onToggle={() => toggleSection("constraints")}
                    >
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Time Limit"
                                    error={errors.baseTimeLimitMs?.message}
                                    description="Maximum execution time in milliseconds"
                                >
                                    <div className="relative">
                                        <Input
                                            id="baseTimeLimitMs"
                                            type="number"
                                            min={1}
                                            max={300000}
                                            className="pr-14"
                                            {...register("baseTimeLimitMs", {valueAsNumber: true})}
                                            disabled={isPending}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">ms</span>
                                    </div>
                                </FormField>
                                <FormField
                                    label="Memory Limit"
                                    error={errors.baseMemoryLimitMb?.message}
                                    description="Maximum memory usage in megabytes"
                                >
                                    <div className="relative">
                                        <Input
                                            id="baseMemoryLimitMb"
                                            type="number"
                                            min={1}
                                            max={1024}
                                            className="pr-14"
                                            {...register("baseMemoryLimitMb", {valueAsNumber: true})}
                                            disabled={isPending}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">MB</span>
                                    </div>
                                </FormField>
                            </div>

                            <FormField
                                label="Constraints"
                                error={errors.constraints?.message as string | undefined}
                                description="Define input bounds. Each constraint appears on its own line."
                            >
                                <div className="flex flex-col gap-2">
                                    {watchedConstraints.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic py-1">No constraints added yet.</p>
                                    )}
                                    {watchedConstraints.map((constraint, i) => (
                                        <div key={i} className="group flex items-center gap-2">
                                            <div className="flex-1 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                                                    {String(i + 1).padStart(2, "0")}
                                                </span>
                                                <Input
                                                    placeholder="e.g. 2 <= nums.length <= 10^4"
                                                    className="pl-8 font-mono text-sm"
                                                    value={constraint}
                                                    onChange={(e) => updateConstraint(i, e.target.value)}
                                                    disabled={isPending}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => removeConstraint(i)}
                                                className="shrink-0 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 6L6 18M6 6l12 12"/>
                                                </svg>
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addConstraint}
                                        className="self-start mt-1"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                                            <path d="M12 5v14M5 12h14"/>
                                        </svg>
                                        Add Constraint
                                    </Button>
                                </div>
                            </FormField>
                        </div>
                    </SectionCard>

                    {/* ── 03 Test Cases ── */}
                    <SectionCard
                        number="03"
                        title="Test Cases"
                        color="rose"
                        badge={testCaseList.length > 0 ? testCaseList.length : undefined}
                        isOpen={isOpen("testcases")}
                        onToggle={() => toggleSection("testcases")}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                                </svg>
                                <span>Test cases verify solutions. <strong className="text-foreground">stdin</strong> is the standard input and <strong className="text-foreground">expected stdout</strong> is the expected output. Use hidden test cases to prevent hardcoding.</span>
                            </div>

                            {testCaseList.length === 0 && (
                                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 py-10 gap-3">
                                    <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-muted-foreground">
                                            <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                        </svg>
                                    </div>
                                    <p className="text-sm text-muted-foreground">No test cases added yet.</p>
                                    <p className="text-xs text-muted-foreground/60">Add at least one test case to verify solutions.</p>
                                </div>
                            )}

                            {testCaseList.map((tc, i) => (
                                <div key={i} className="rounded-xl border bg-card">
                                    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center justify-center size-5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                                                {i + 1}
                                            </span>
                                            <span className="text-sm font-semibold">Test Case {i + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={tc.isHidden}
                                                    onChange={(e) => updateTestCase(i, "isHidden", e.target.checked)}
                                                    className="rounded border-input"
                                                />
                                                Hidden
                                            </label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => removeTestCase(i)}
                                                className="text-muted-foreground/50 hover:text-destructive"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormField label="Standard Input (stdin)" className="text-xs" description="Input data your program reads from stdin">
                                                <div className="relative">
                                                    <div className="absolute left-3 top-2.5 text-[10px] font-mono font-bold text-muted-foreground/60 tracking-widest uppercase">in</div>
                                                    <textarea
                                                        placeholder="[2,7,11,15]\n9"
                                                        className="w-full min-h-20 rounded-lg border border-input bg-background px-3 pl-9 pt-2 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring/50"
                                                        value={tc.stdin}
                                                        onChange={(e) => updateTestCase(i, "stdin", e.target.value)}
                                                        disabled={isPending}
                                                    />
                                                </div>
                                            </FormField>
                                            <FormField label="Expected Output (stdout)" className="text-xs" description="The correct output your program should produce">
                                                <div className="relative">
                                                    <div className="absolute left-3 top-2.5 text-[10px] font-mono font-bold text-muted-foreground/60 tracking-widest uppercase">out</div>
                                                    <textarea
                                                        placeholder="[0,1]"
                                                        className="w-full min-h-20 rounded-lg border border-input bg-background px-3 pl-9 pt-2 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring/50"
                                                        value={tc.expectedStdout}
                                                        onChange={(e) => updateTestCase(i, "expectedStdout", e.target.value)}
                                                        disabled={isPending}
                                                    />
                                                </div>
                                            </FormField>
                                        </div>
                                        <FormField label="Explanation" className="text-xs" description="Optional explanation shown to students after submission (not shown for hidden cases)">
                                            <Input
                                                placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                                                value={tc.explanation}
                                                onChange={(e) => updateTestCase(i, "explanation", e.target.value)}
                                                disabled={isPending}
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTestCase}
                                className="self-start"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                                Add Test Case
                            </Button>
                        </div>
                    </SectionCard>

                    {/* ── 04 Examples ── */}
                    <SectionCard
                        number="04"
                        title="Examples"
                        color="cyan"
                        badge={watchedExamples.length > 0 ? watchedExamples.length : undefined}
                        isOpen={isOpen("examples")}
                        onToggle={() => toggleSection("examples")}
                    >
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Show worked examples to help students understand the problem.
                            </p>
                            {watchedExamples.map((ex, i) => (
                                <div key={i} className="rounded-xl border border-dashed bg-card">
                                    <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/20">
                                        <span className="text-sm font-semibold">Example {i + 1}</span>
                                        {watchedExamples.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => removeExample(i)}
                                                className="text-muted-foreground/50 hover:text-destructive"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 6L6 18M6 6l12 12"/>
                                                </svg>
                                            </Button>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col gap-3">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <FormField label="Input" className="text-xs">
                                                <textarea
                                                    placeholder="[2,7,11,15], target=9"
                                                    className="w-full min-h-16 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring/50"
                                                    {...register(`examples.${i}.input` as const)}
                                                    disabled={isPending}
                                                />
                                            </FormField>
                                            <FormField label="Expected Output" className="text-xs">
                                                <textarea
                                                    placeholder="[0,1]"
                                                    className="w-full min-h-16 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring/50"
                                                    {...register(`examples.${i}.output` as const)}
                                                    disabled={isPending}
                                                />
                                            </FormField>
                                        </div>
                                        <FormField label="Explanation (optional)" className="text-xs">
                                            <Input
                                                placeholder="Because nums[0] + nums[1] == 9..."
                                                {...register(`examples.${i}.explanation` as const)}
                                                disabled={isPending}
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addExample}
                                className="self-start"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                                Add Example
                            </Button>
                        </div>
                    </SectionCard>

                    {/* ── 05 Hints ── */}
                    <SectionCard
                        number="05"
                        title="Hints"
                        color="violet"
                        badge={watchedHints.length > 0 ? watchedHints.length : undefined}
                        isOpen={isOpen("hints")}
                        onToggle={() => toggleSection("hints")}
                    >
                        <div className="flex flex-col gap-3">
                            <p className="text-sm text-muted-foreground">
                                Progressive hints revealed one at a time. Students see hints only when they ask for them.
                            </p>
                            {watchedHints.map((hint, i) => (
                                <div key={i} className="group flex items-center gap-2">
                                    <span className="shrink-0 inline-flex items-center justify-center size-6 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <Input
                                            placeholder={`Hint ${i + 1}`}
                                            {...register(`hints.${i}` as const)}
                                            disabled={isPending}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => removeHint(i)}
                                        className="shrink-0 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12"/>
                                        </svg>
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addHint}
                                className="self-start"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                                Add Hint
                            </Button>
                        </div>
                    </SectionCard>

                    {/* ── 06 Starter Code ── */}
                    <SectionCard
                        number="06"
                        title="Starter Code"
                        color="emerald"
                        isOpen={isOpen("starter")}
                        onToggle={() => toggleSection("starter")}
                    >
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                                </svg>
                                <span>Provide initial code that students will build upon. Students see this when they begin the challenge.</span>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-2">
                                {Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => (
                                    <div key={lang} className="rounded-xl border border-input overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-input">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn("text-xs font-semibold", config.badgeBg, config.badgeClass)}>
                                                    {config.label}
                                                </Badge>
                                            </div>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <span className="text-xs text-muted-foreground/50 cursor-help">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                                            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                                                        </svg>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Shown to students as the initial code scaffold</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <MonacoEditor
                                            height="200px"
                                            language={config.monacoLanguage}
                                            value={watchedStarterCode[lang] ?? DEFAULT_STARTER_CODE[lang]}
                                            onChange={(val) =>
                                                setValue(`starterCode.${lang}` as const, val ?? DEFAULT_STARTER_CODE[lang])
                                            }
                                            theme="vs-dark"
                                            options={{
                                                minimap: {enabled: false},
                                                fontSize: 13,
                                                lineNumbers: "on",
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                                tabSize: 4,
                                                padding: {top: 8, bottom: 8},
                                                wordWrap: "on",
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionCard>
                </div>

                {/* Submit Button */}
                {!editMode && (
                    <div className="flex justify-end pt-6 border-t">
                        <Button
                            type="submit"
                            disabled={isPending}
                            size="lg"
                            className="px-8 gap-2"
                        >
                            {isPending ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                                    </svg>
                                    {submitLabel}
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </TooltipProvider>
    );
}

// ---------------------------------------------------------------------------
// Section Card Component
// ---------------------------------------------------------------------------
interface SectionCardProps {
    number: string;
    title: string;
    color: "indigo" | "amber" | "rose" | "cyan" | "violet" | "emerald";
    badge?: number;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    indigo: {bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20", dot: "bg-indigo-500"},
    amber: {bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20", dot: "bg-amber-500"},
    rose: {bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20", dot: "bg-rose-500"},
    cyan: {bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/20", dot: "bg-cyan-500"},
    violet: {bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/20", dot: "bg-violet-500"},
    emerald: {bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-500"},
};

function SectionCard({number, title, color, badge, isOpen, onToggle, children}: SectionCardProps) {
    const cfg = COLOR_MAP[color];

    return (
        <div className={cn("border rounded-2xl overflow-hidden transition-all duration-200",
            isOpen ? "bg-muted/20 border-muted-foreground/10 shadow-sm" : "bg-card hover:bg-muted/30 hover:border-muted-foreground/15")}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-3.5 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
                <div className={cn("shrink-0 flex items-center justify-center size-8 rounded-lg font-black text-sm tracking-tight",
                    cfg.bg, cfg.text)}>
                    {number}
                </div>
                <span className="flex-1 font-semibold text-sm">{title}</span>
                {badge !== undefined && (
                    <Badge variant="secondary" className="shrink-0 tabular-nums">
                        {badge}
                    </Badge>
                )}
                <span className={cn(
                    "shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                )}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </span>
            </button>
            {isOpen && (
                <div className="px-5 pb-6">
                    <div className={cn("h-px bg-gradient-to-r from-transparent", cfg.bg.replace("/10", "/20"), "to-transparent mb-6 -mt-1")}/>
                    {children}
                </div>
            )}
        </div>
    );
}
