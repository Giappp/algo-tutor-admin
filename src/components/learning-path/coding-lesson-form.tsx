"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import {useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {FormField} from "@/components/learning-path/form-field";
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

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string; bgColor: string }[] = [
    {
        value: "EASY",
        label: "Easy",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20",
    },
    {
        value: "MEDIUM",
        label: "Medium",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20",
    },
    {
        value: "HARD",
        label: "Hard",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10 border-red-500/20 hover:bg-red-500/20",
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

const LANGUAGE_CONFIG: Record<string, { label: string; monacoLanguage: string; badgeClass: string }> = {
    java: {label: "Java", monacoLanguage: "java", badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400"},
    python: {label: "Python", monacoLanguage: "python", badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400"},
};

interface CodingLessonFormProps {
    defaultValues?: Partial<CreateCodingLesson>;
    onSubmit: (data: CreateCodingLesson) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    editMode?: boolean;
}

export function CodingLessonForm({
                                     defaultValues,
                                     onSubmit,
                                     isPending,
                                     submitLabel = "Create Lesson",
                                     editMode,
                                 }: CodingLessonFormProps) {
    const [activeSection, setActiveSection] = useState<string | null>("basic");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [constraintsText, setConstraintsText] = useState("");

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
            constraints: undefined,
            starterCode: {...DEFAULT_STARTER_CODE},
            hints: [],
            examples: [],
            keyInsights: [],
            ...defaultValues,
        },
    });

    const watchedHints = watch("hints") ?? [];
    const watchedExamples = watch("examples") ?? [];
    const watchedStarterCode = watch("starterCode") ?? {};
    const watchedDifficulty = watch("difficulty");

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
                keyInsights: defaultValues.keyInsights ?? [],
            };
            reset(processedDefaults);
            const constraintsValue = defaultValues.constraints;
            setConstraintsText(
                Array.isArray(constraintsValue)
                    ? constraintsValue.join("\n")
                    : (constraintsValue ?? "")
            );
        }
    }, [defaultValues, reset]);

    const handleConstraintsChange = (value: string) => {
        setConstraintsText(value);
        const lines = value.split("\n").filter((line) => line.trim() !== "");
        setValue("constraints", lines);
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

    const handleFormSubmit = async (data: CreateCodingLesson) => {
        setIsSubmitting(true);
        try {
            const finalData = {
                ...data,
                type: "CODING" as const,
                starterCode: {
                    java: watchedStarterCode["java"] ?? DEFAULT_STARTER_CODE["java"],
                    python: watchedStarterCode["python"] ?? DEFAULT_STARTER_CODE["python"],
                },
            };
            await onSubmit(finalData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    return (
        <TooltipProvider>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-12 rounded-lg bg-emerald-500/10">
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">&lt;/&gt;</span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold">Coding Lesson</h2>
                        <p className="text-sm text-muted-foreground">Create a coding challenge for students to solve</p>
                    </div>
                </div>

                {/* Main Form - Section-based layout */}
                <div className="flex flex-col gap-4">
                    {/* Basic Information */}
                    <SectionCard
                        title="Basic Information"
                        number="01"
                        color="indigo"
                        isOpen={activeSection === "basic"}
                        onToggle={() => toggleSection("basic")}
                    >
                        <div className="flex flex-col gap-5">
                            <FormField label="Title" error={errors.title?.message} required>
                                <Input
                                    id="title"
                                    placeholder="e.g. Two Sum"
                                    aria-invalid={!!errors.title}
                                    disabled={isPending}
                                    {...register("title")}
                                />
                            </FormField>

                            <FormField label="Problem Statement" error={errors.statement?.message} required>
                                <Textarea
                                    id="statement"
                                    placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
                                    className="min-h-32"
                                    aria-invalid={!!errors.statement}
                                    disabled={isPending}
                                    {...register("statement")}
                                />
                            </FormField>

                            <FormField label="Difficulty" error={errors.difficulty?.message}>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {DIFFICULTY_OPTIONS.map((opt) => {
                                        const isSelected = watchedDifficulty === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setValue("difficulty", opt.value as Difficulty)}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                                                    isSelected
                                                        ? opt.bgColor + " " + opt.color + " border-current"
                                                        : "border-border hover:border-muted-foreground/50 hover:bg-muted"
                                                )}
                                            >
                                                <span className="text-xs font-bold">{opt.label.charAt(0)}</span>
                                                <span>{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </FormField>
                        </div>
                    </SectionCard>

                    {/* Constraints & Limits */}
                    <SectionCard
                        title="Constraints & Limits"
                        number="02"
                        color="amber"
                        isOpen={activeSection === "constraints"}
                        onToggle={() => toggleSection("constraints")}
                    >
                        <div className="flex flex-col gap-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Time Limit (ms)"
                                    error={errors.baseTimeLimitMs?.message}
                                    description="Maximum execution time per test case"
                                >
                                    <Input
                                        id="baseTimeLimitMs"
                                        type="number"
                                        min={1}
                                        max={300000}
                                        {...register("baseTimeLimitMs", {valueAsNumber: true})}
                                        disabled={isPending}
                                    />
                                </FormField>
                                <FormField
                                    label="Memory Limit (MB)"
                                    error={errors.baseMemoryLimitMb?.message}
                                    description="Maximum memory usage per test case"
                                >
                                    <Input
                                        id="baseMemoryLimitMb"
                                        type="number"
                                        min={1}
                                        max={1024}
                                        {...register("baseMemoryLimitMb", {valueAsNumber: true})}
                                        disabled={isPending}
                                    />
                                </FormField>
                            </div>

                            <FormField
                                label="Constraints"
                                error={errors.constraints?.message}
                                description="One constraint per line (e.g., 2 <= nums.length <= 10^4)"
                            >
                                <Textarea
                                    id="constraints"
                                    placeholder={"2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9"}
                                    className="min-h-24 font-mono text-sm"
                                    disabled={isPending}
                                    value={constraintsText}
                                    onChange={(e) => handleConstraintsChange(e.target.value)}
                                />
                            </FormField>
                        </div>
                    </SectionCard>

                    {/* Examples */}
                    <SectionCard
                        title="Examples"
                        number="03"
                        color="cyan"
                        badge={watchedExamples.length > 0 ? watchedExamples.length : undefined}
                        isOpen={activeSection === "examples"}
                        onToggle={() => toggleSection("examples")}
                    >
                        <div className="flex flex-col gap-4">
                            {watchedExamples.map((ex, i) => (
                                <Card key={i} className="border-dashed">
                                    <CardHeader className="py-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                Example {i + 1}
                                            </CardTitle>
                                            {watchedExamples.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => removeExample(i)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <span className="sr-only">Remove</span>
                                                    &times;
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <FormField label="Input" className="text-xs">
                                                <Textarea
                                                    placeholder="[2,7,11,15], target=9"
                                                    className="font-mono text-sm min-h-16"
                                                    {...register(`examples.${i}.input` as const)}
                                                    disabled={isPending}
                                                />
                                            </FormField>
                                            <FormField label="Expected Output" className="text-xs">
                                                <Textarea
                                                    placeholder="[0,1]"
                                                    className="font-mono text-sm min-h-16"
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
                                    </CardContent>
                                </Card>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addExample}
                                className="self-start"
                            >
                                + Add Example
                            </Button>
                        </div>
                    </SectionCard>

                    {/* Hints */}
                    <SectionCard
                        title="Hints"
                        number="04"
                        color="violet"
                        badge={watchedHints.length > 0 ? watchedHints.length : undefined}
                        isOpen={activeSection === "hints"}
                        onToggle={() => toggleSection("hints")}
                    >
                        <div className="flex flex-col gap-3">
                            <p className="text-sm text-muted-foreground">
                                Add hints to help students who are stuck. They will be revealed one at a time.
                            </p>
                            {watchedHints.map((hint, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="flex-1 relative">
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
                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                    >
                                        &times;
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
                                + Add Hint
                            </Button>
                        </div>
                    </SectionCard>

                    {/* Starter Code */}
                    <SectionCard
                        title="Starter Code"
                        number="05"
                        color="emerald"
                        isOpen={activeSection === "starter"}
                        onToggle={() => toggleSection("starter")}
                    >
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Provide starter code for students. Students will see this when they start the challenge.
                            </p>
                            {Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => (
                                <FormField key={lang} label={`${config.label} Starter Code`} className="text-sm">
                                    <div className="rounded-xl border border-input overflow-hidden">
                                        <div
                                            className="bg-muted/50 px-3 py-1.5 border-b border-input flex items-center justify-between">
                                            <Badge variant="outline" className={cn("text-xs", config.badgeClass)}>
                                                {config.label}
                                            </Badge>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <span className="text-xs text-muted-foreground cursor-help">?</span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Code shown to students as starting point</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <MonacoEditor
                                            height="180px"
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
                                            }}
                                        />
                                    </div>
                                </FormField>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                {/* Submit Button */}
                {!editMode && (
                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            type="submit"
                            disabled={isPending || isSubmitting}
                            size="lg"
                        >
                            {isPending || isSubmitting ? "Saving..." : submitLabel}
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
    title: string;
    number: string;
    color: "indigo" | "amber" | "cyan" | "violet" | "emerald";
    badge?: number;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const COLOR_MAP = {
    indigo: {bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20"},
    amber: {bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20"},
    cyan: {bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/20"},
    violet: {bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/20"},
    emerald: {bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20"},
};

function SectionCard({title, number, color, badge, isOpen, onToggle, children}: SectionCardProps) {
    const colorConfig = COLOR_MAP[color];

    return (
        <div className={cn("border rounded-xl overflow-hidden transition-all", isOpen && "bg-muted/20")}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
            >
                <Badge variant="outline"
                       className={cn("shrink-0", colorConfig.bg, colorConfig.text, colorConfig.border)}>
                    {number}
                </Badge>
                <span className="font-medium flex-1">{title}</span>
                {badge !== undefined && (
                    <Badge variant="secondary" className="ml-1">{badge}</Badge>
                )}
                <span className={cn("text-muted-foreground transition-transform", isOpen && "rotate-180")}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                </span>
            </button>
            {isOpen && (
                <div className="px-4 pb-6">
                    {children}
                </div>
            )}
        </div>
    );
}
