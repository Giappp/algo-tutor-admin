"use client";

import React, { useCallback, useImperativeHandle, useRef, useState } from "react";
import { Control, Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { ChevronDown, FileCode2, Info, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FormField } from "@/components/learning-path/form-field";
import { MarkdownSplitEditor } from "@/components/ui/markdown-split-editor";
import { SortableListItem, swapItems } from "@/components/ui/sortable-list";
import { Difficulty } from "@/types/learning-path";
import { CodingLessonDTO, EditCodingContentSchema } from "@/types/learning-path/schema";
import { SaveStatusIndicator } from "@/components/ui/save-status-indicator";
import { useAutosave } from "@/hooks/use-autosave";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { useKeyboardSave } from "@/hooks/use-keyboard-save";
import { toast } from "sonner";

const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="h-40 rounded-xl border border-input bg-muted animate-pulse" />
        ),
    }
);

const DIFFICULTY_OPTIONS: {
    value: Difficulty;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
}[] = [
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

const LANGUAGE_CONFIG: Record<string, {
    label: string;
    monacoLanguage: string;
    badgeClass: string;
    badgeBg: string;
}> = {
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

export type CodingContentFormHandle = {
    trigger: () => Promise<boolean>;
    submit: () => Promise<void>;
    getValues: () => CodingLessonDTO;
};

interface CodingContentFormProps {
    defaultValues?: Partial<CodingLessonDTO>;
    onSubmit: (data: CodingLessonDTO) => Promise<void>;
    isPending?: boolean;
    /** Enable autosave (for edit mode) */
    enableAutosave?: boolean;
    formRef?: React.RefObject<CodingContentFormHandle | null>;
}

/**
 * Coding lesson content form — used in the Detail page's Content tab.
 * Does NOT include test cases (managed in separate tab).
 * Supports autosave, Ctrl+S, and unsaved changes warning.
 */
export function CodingContentForm({
    defaultValues,
    onSubmit,
    isPending,
    enableAutosave = false,
    formRef: externalFormRef,
}: CodingContentFormProps) {
    const internalFormRef = useRef<CodingContentFormHandle | null>(null);
    const formRef = externalFormRef ?? internalFormRef;

    const [activeSection, setActiveSection] = useState<string>("basic");

    const {
        register,
        handleSubmit,
        setValue,
        control,
        getValues,
        formState: { errors, isDirty },
    } = useForm<CodingLessonDTO>({
        resolver: zodResolver(EditCodingContentSchema),
        defaultValues: {
            type: "CODING",
            title: "",
            statement: "",
            baseTimeLimitMs: 2000,
            baseMemoryLimitMb: 256,
            constraints: [],
            starterCode: { ...DEFAULT_STARTER_CODE },
            hints: [],
            examples: [],
            ...defaultValues,
        },
    });

    const watchedDifficulty = useWatch({ control, name: "difficulty" });
    const constraints = useWatch({ control, name: "constraints" }) || [];
    const hints = useWatch({ control, name: "hints" }) || [];
    const watchedData = useWatch({ control });

    const {
        fields: exampleFields,
        append: appendExample,
        remove: removeExample,
        swap: swapExample,
    } = useFieldArray({ control, name: "examples" });

    // Autosave
    const handleAutoSave = useCallback(async () => {
        await handleSubmit(async (data) => {
            const finalData = {
                ...data,
                type: "CODING" as const,
                starterCode: {
                    java: data.starterCode?.java ?? DEFAULT_STARTER_CODE["java"],
                    python: data.starterCode?.python ?? DEFAULT_STARTER_CODE["python"],
                },
            };
            await onSubmit(finalData);
        })();
    }, [handleSubmit, onSubmit]);

    const { status, lastSavedAt, saveNow } = useAutosave({
        data: watchedData,
        onSave: handleAutoSave,
        delay: 5000,
        enabled: enableAutosave && isDirty,
    });

    // Unsaved changes warning
    useUnsavedChanges(isDirty);

    // Ctrl+S
    useKeyboardSave(saveNow, enableAutosave);

    // Constraint handlers
    const handleAddConstraint = () => {
        if (constraints.length >= 10) return;
        setValue("constraints", [...constraints, ""], { shouldValidate: true, shouldDirty: true });
    };

    const handleRemoveConstraint = (indexToRemove: number) => {
        setValue("constraints", constraints.filter((_, i) => i !== indexToRemove), { shouldValidate: true, shouldDirty: true });
    };

    const handleUpdateConstraint = (indexToUpdate: number, newValue: string) => {
        const updated = [...constraints];
        updated[indexToUpdate] = newValue;
        setValue("constraints", updated, { shouldValidate: true });
    };

    const handleMoveConstraint = (from: number, to: number) => {
        setValue("constraints", swapItems(constraints, from, to), { shouldValidate: true, shouldDirty: true });
    };

    // Hint handlers
    const handleAddHint = () => {
        if (hints.length >= 10) return;
        setValue("hints", [...hints, ""], { shouldValidate: true, shouldDirty: true });
    };

    const handleRemoveHint = (indexToRemove: number) => {
        setValue("hints", hints.filter((_, i) => i !== indexToRemove), { shouldValidate: true, shouldDirty: true });
    };

    const handleUpdateHint = (indexToUpdate: number, newValue: string) => {
        const updated = [...hints];
        updated[indexToUpdate] = newValue;
        setValue("hints", updated, { shouldValidate: true });
    };

    const handleMoveHint = (from: number, to: number) => {
        setValue("hints", swapItems(hints, from, to), { shouldValidate: true, shouldDirty: true });
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
                    starterCode: {
                        java: data.starterCode?.java ?? DEFAULT_STARTER_CODE["java"],
                        python: data.starterCode?.python ?? DEFAULT_STARTER_CODE["python"],
                    },
                };
                await onSubmit(finalData);
            })();
        },
        getValues: () => getValues(),
    }));

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? "" : section);
    };

    const isOpen = (section: string) => activeSection === section;

    return (
        <TooltipProvider>
            <form
                onSubmit={handleSubmit(async (data) => {
                    const finalData = {
                        ...data,
                        type: "CODING" as const,
                        starterCode: {
                            java: data.starterCode?.java ?? DEFAULT_STARTER_CODE["java"],
                            python: data.starterCode?.python ?? DEFAULT_STARTER_CODE["python"],
                        },
                    };
                    await onSubmit(finalData);
                }, (formErrors) => {
                    // Show toast with first error
                    const firstError = Object.values(formErrors).find(e => e?.message);
                    if (firstError && "message" in firstError) {
                        toast.error(firstError.message as string);
                    } else {
                        toast.error("Please fix the validation errors before saving");
                    }
                    // Open the section containing the first error
                    if (formErrors.title || formErrors.statement || formErrors.difficulty) {
                        setActiveSection("basic");
                    } else if (formErrors.baseTimeLimitMs || formErrors.baseMemoryLimitMb || formErrors.constraints) {
                        setActiveSection("constraints");
                    } else if (formErrors.examples) {
                        setActiveSection("examples");
                    } else if (formErrors.hints) {
                        setActiveSection("hints");
                    }
                })}
                className="flex flex-col gap-6"
            >
                {/* Header with save status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20">
                            <FileCode2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold tracking-tight">Problem Content</h2>
                            <p className="text-xs text-muted-foreground">
                                Statement, constraints, examples, and starter code
                            </p>
                        </div>
                    </div>
                    {enableAutosave && (
                        <SaveStatusIndicator
                            status={status}
                            isDirty={isDirty}
                            lastSavedAt={lastSavedAt}
                        />
                    )}
                </div>

                {/* SECTIONS */}
                <div className="flex flex-col gap-3">
                    {/* ── 01 Basic Information ── */}
                    <SectionCard
                        title="Basic Information"
                        isOpen={isOpen("basic")}
                        onToggle={() => toggleSection("basic")}
                    >
                        <div className="flex flex-col gap-6">
                            <FormField label="Problem Title" error={errors.title?.message} required>
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
                                    render={({ field }) => (
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
                    </SectionCard>

                    {/* ── 02 Constraints & Limits ── */}
                    <SectionCard
                        title="Constraints & Limits"
                        badge={constraints.length > 0 ? constraints.length : undefined}
                        isOpen={isOpen("constraints")}
                        onToggle={() => toggleSection("constraints")}
                    >
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField label="Time Limit" error={errors.baseTimeLimitMs?.message}>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={300000}
                                            className="pr-14"
                                            {...register("baseTimeLimitMs", { valueAsNumber: true })}
                                            disabled={isPending}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">ms</span>
                                    </div>
                                </FormField>
                                <FormField label="Memory Limit" error={errors.baseMemoryLimitMb?.message}>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={1024}
                                            className="pr-14"
                                            {...register("baseMemoryLimitMb", { valueAsNumber: true })}
                                            disabled={isPending}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">MB</span>
                                    </div>
                                </FormField>
                            </div>

                            <FormField label="Constraints" error={errors.constraints?.message as string | undefined}>
                                <div className="flex flex-col gap-2">
                                    {constraints.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic py-1">No constraints added yet.</p>
                                    )}
                                    {constraints.map((field, i) => (
                                        <SortableListItem
                                            key={i}
                                            index={i}
                                            total={constraints.length}
                                            onMoveUp={() => handleMoveConstraint(i, i - 1)}
                                            onMoveDown={() => handleMoveConstraint(i, i + 1)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                                                        {String(i + 1).padStart(2, "0")}
                                                    </span>
                                                    <Input
                                                        placeholder="e.g. 2 <= nums.length <= 10^4"
                                                        className="pl-8 font-mono text-sm"
                                                        value={field}
                                                        onChange={(e) => handleUpdateConstraint(i, e.target.value)}
                                                        disabled={isPending}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleRemoveConstraint(i)}
                                                    className="shrink-0 text-muted-foreground/50 hover:text-destructive"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </SortableListItem>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddConstraint} className="self-start mt-1">
                                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                                        Add Constraint
                                    </Button>
                                </div>
                            </FormField>
                        </div>
                    </SectionCard>

                    {/* ── 03 Examples ── */}
                    <SectionCard
                        title="Examples"
                        badge={exampleFields.length > 0 ? exampleFields.length : undefined}
                        isOpen={isOpen("examples")}
                        onToggle={() => toggleSection("examples")}
                    >
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Show worked examples to help students understand the problem.
                            </p>
                            {exampleFields.map((field, i) => (
                                <SortableListItem
                                    key={field.id}
                                    index={i}
                                    total={exampleFields.length}
                                    onMoveUp={() => swapExample(i, i - 1)}
                                    onMoveDown={() => swapExample(i, i + 1)}
                                    showGrip={exampleFields.length > 1}
                                >
                                    <div className="rounded-xl border border-dashed bg-card">
                                        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/20">
                                            <span className="text-sm font-semibold">Example {i + 1}</span>
                                            {exampleFields.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeExample(i)} className="text-muted-foreground/50 hover:text-destructive">
                                                    <X className="w-3.5 h-3.5" />
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
                                </SortableListItem>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendExample({ input: "", output: "", explanation: "" })} className="self-start">
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                Add Example
                            </Button>
                        </div>
                    </SectionCard>

                    {/* ── 04 Hints ── */}
                    <SectionCard
                        title="Hints"
                        badge={hints.length > 0 ? hints.length : undefined}
                        isOpen={isOpen("hints")}
                        onToggle={() => toggleSection("hints")}
                    >
                        <div className="flex flex-col gap-3">
                            <p className="text-sm text-muted-foreground">
                                Progressive hints revealed one at a time when students ask.
                            </p>
                            {hints.map((field, i) => (
                                <SortableListItem
                                    key={i}
                                    index={i}
                                    total={hints.length}
                                    onMoveUp={() => handleMoveHint(i, i - 1)}
                                    onMoveDown={() => handleMoveHint(i, i + 1)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="shrink-0 inline-flex items-center justify-center size-6 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold">
                                            {i + 1}
                                        </span>
                                        <div className="flex-1">
                                            <Input
                                                placeholder={`Hint ${i + 1}`}
                                                value={field}
                                                onChange={(e) => handleUpdateHint(i, e.target.value)}
                                                disabled={isPending}
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleRemoveHint(i)} className="shrink-0 text-muted-foreground/50 hover:text-destructive">
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </SortableListItem>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={handleAddHint} className="self-start">
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                Add Hint
                            </Button>
                        </div>
                    </SectionCard>

                    {/* ── 05 Starter Code ── */}
                    <SectionCard
                        title="Starter Code"
                        isOpen={isOpen("starter")}
                        onToggle={() => toggleSection("starter")}
                    >
                        <StarterCodeSection
                            control={control}
                            isPending={isPending}
                        />
                    </SectionCard>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-4 border-t">
                    {enableAutosave && (
                        <p className="text-xs text-muted-foreground">
                            Auto-saves after 5s of inactivity • <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px] font-mono">Ctrl+S</kbd> to save immediately
                        </p>
                    )}
                    <Button
                        type="submit"
                        disabled={isPending}
                        size="lg"
                        className="px-8 gap-2 ml-auto"
                    >
                        {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </TooltipProvider>
    );
}

// ---------------------------------------------------------------------------
// Starter Code Section — Tabbed Monaco editors with expandable height
// ---------------------------------------------------------------------------

interface StarterCodeSectionProps {
    control: Control<CodingLessonDTO>;
    isPending?: boolean;
}

function StarterCodeSection({ control, isPending }: StarterCodeSectionProps) {
    const [activeLang, setActiveLang] = useState<string>("java");
    const [isExpanded, setIsExpanded] = useState(false);

    const editorHeight = isExpanded ? "450px" : "280px";

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Initial code students will build upon.</span>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-muted-foreground"
                >
                    {isExpanded ? "Collapse" : "Expand"}
                </Button>
            </div>

            {/* Language tabs */}
            <div className="rounded-xl border border-input overflow-hidden">
                <div className="flex items-center gap-0 border-b border-input bg-muted/40">
                    {Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => setActiveLang(lang)}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px",
                                activeLang === lang
                                    ? `${config.badgeClass} border-current bg-background/50`
                                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/60"
                            )}
                        >
                            {config.label}
                        </button>
                    ))}
                </div>

                {/* Editor for active language */}
                {Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => (
                    <div key={lang} className={cn(activeLang === lang ? "block" : "hidden")}>
                        <Controller
                            name={`starterCode.${lang}` as const}
                            control={control}
                            render={({ field }) => (
                                <MonacoEditor
                                    height={editorHeight}
                                    language={config.monacoLanguage}
                                    value={field.value}
                                    onChange={field.onChange}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: "on",
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 4,
                                        padding: { top: 12, bottom: 12 },
                                        wordWrap: "on",
                                        renderLineHighlight: "all",
                                        bracketPairColorization: { enabled: true },
                                        guides: { bracketPairs: true },
                                        readOnly: isPending,
                                    }}
                                />
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Section Card (simplified)
// ---------------------------------------------------------------------------
interface SectionCardProps {
    title: string;
    badge?: number;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function SectionCard({ title, badge, isOpen, onToggle, children }: SectionCardProps) {
    return (
        <div className={cn(
            "border rounded-xl overflow-hidden transition-all duration-200",
            isOpen ? "bg-muted/20 border-muted-foreground/10 shadow-sm" : "bg-card hover:bg-muted/30"
        )}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
                <span className="flex-1 font-semibold text-sm">{title}</span>
                {badge !== undefined && (
                    <Badge variant="secondary" className="shrink-0 tabular-nums">{badge}</Badge>
                )}
                <span className={cn("shrink-0 transition-transform duration-200", isOpen && "rotate-180")}>
                    <ChevronDown className="w-4 h-4" />
                </span>
            </button>
            {isOpen && (
                <div className="px-4 pb-5 pt-1">{children}</div>
            )}
        </div>
    );
}
