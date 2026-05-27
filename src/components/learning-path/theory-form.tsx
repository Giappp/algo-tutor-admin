"use client";

import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {useImperativeHandle, useRef} from "react";
import {BookOpen, BookOpenIcon, FileText, ListChecks} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {FormField} from "@/components/learning-path/form-field";
import {CreateTheoryLessonSchema, TheoryLessonDTO} from "@/types/learning-path/schema";
import {MarkdownSplitEditor} from "@/components/ui/markdown-split-editor";

const DIFFICULTY_OPTIONS = [
    {
        value: "EASY" as const,
        label: "Easy",
        description: "Beginner-friendly",
        color: "text-emerald-600 dark:text-emerald-400",
    },
    {
        value: "MEDIUM" as const,
        label: "Medium",
        description: "Moderate",
        color: "text-amber-600 dark:text-amber-400",
    },
    {
        value: "HARD" as const,
        label: "Hard",
        description: "Advanced",
        color: "text-red-600 dark:text-red-400",
    },
];

// ---------------------------------------------------------------------------
// Markdown Templates
// ---------------------------------------------------------------------------

interface MarkdownTemplate {
    id: string;
    label: string;
    icon: React.ElementType;
    content: string;
}

const MARKDOWN_TEMPLATES: MarkdownTemplate[] = [
    {
        id: "concept",
        label: "Concept",
        icon: BookOpen,
        content: `## What is [Concept]?

[Brief introduction to the concept — explain what it is and why it matters in 2-3 sentences.]

### Key Points

- [Point 1]
- [Point 2]
- [Point 3]

### Example

[Show a concrete example with code or visual representation.]

\`\`\`java
// Your example code here
\`\`\`

### Summary

[Recap the main takeaways and what was covered.]`,
    },
    {
        id: "step-by-step",
        label: "Step-by-Step",
        icon: ListChecks,
        content: `## [Topic Title]

[Introduction paragraph explaining what the learner will learn.]

### Step 1: [Title]

[Description of this step.]

\`\`\`java
// Step 1 code
\`\`\`

### Step 2: [Title]

[Description of this step.]

\`\`\`java
// Step 2 code
\`\`\`

### Step 3: [Title]

[Description of this step.]

\`\`\`java
// Step 3 code
\`\`\`

### Final Result

[Show the complete working example.]`,
    },
    {
        id: "code-walkthrough",
        label: "Code Walkthrough",
        icon: FileText,
        content: `## Code Walkthrough: [Name]

[Brief description of what this code does and when to use it.]

### Code

\`\`\`java
// Your code here
function example() {
    // line by line explanation below
}
\`\`\`

### Line-by-Line Breakdown

1. **[Line description]** — [explanation of what this line does]
2. **[Line description]** — [explanation of what this line does]

### Time & Space Complexity

- **Time:** O(?)
- **Space:** O(?)

### Common Pitfalls

- [Pitfall 1]
- [Pitfall 2]`,
    },
];

type TheoryFormHandle = {
    trigger: () => Promise<boolean>;
    submit: () => Promise<void>;
};

export type {TheoryFormHandle};

interface TheoryFormProps {
    defaultValues?: Partial<TheoryLessonDTO>;
    onSubmit: (data: TheoryLessonDTO) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    formRef?: React.RefObject<TheoryFormHandle | null>;
}

export function TheoryForm({
                               defaultValues,
                               onSubmit,
                               isPending,
                               submitLabel = "Create Lesson",
                               formRef: externalFormRef,
                           }: TheoryFormProps) {
    const internalFormRef = useRef<TheoryFormHandle | null>(null);
    const formRef = externalFormRef ?? internalFormRef;

    const {
        register,
        handleSubmit: RHhandleSubmit,
        setValue,
        control,
        formState: {errors},
    } = useForm<TheoryLessonDTO>({
        resolver: zodResolver(CreateTheoryLessonSchema),
        defaultValues: {
            type: "THEORY",
            title: "",
            content: "",
            difficulty: undefined,
            displayOrder: undefined,
            ...defaultValues,
        },
    });

    const watchedContent = useWatch({control, name: "content"}) ?? "";
    const watchedDifficulty = useWatch({control, name: "difficulty"});

    useImperativeHandle(formRef, () => ({
        trigger: async () => {
            let valid = false;
            await RHhandleSubmit(() => {
                valid = true;
            })();
            return valid;
        },
        submit: async () => {
            await RHhandleSubmit(onSubmit)();
        },
    }));

    return (
        <form id="theory-form" onSubmit={RHhandleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-7 rounded-md bg-blue-500/10">
                    <BookOpenIcon className="size-4 text-blue-600 dark:text-blue-400"/>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Theory Lesson
                </span>
            </div>

            {/* Title */}
            <FormField
                label="Title"
                error={errors.title?.message}
                required
            >
                <Input
                    id="title"
                    placeholder="e.g. Introduction to Binary Search"
                    aria-invalid={!!errors.title}
                    disabled={isPending}
                    className="max-w-2xl"
                    {...register("title")}
                />
            </FormField>

            {/* Difficulty */}
            <FormField label="Difficulty">
                <div className="flex items-center gap-2 flex-wrap">
                    {DIFFICULTY_OPTIONS.map((opt) => {
                        const isSelected = watchedDifficulty === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() =>
                                    setValue("difficulty", opt.value, {
                                        shouldValidate: true,
                                    })
                                }
                                className={cn(
                                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                                    isSelected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border hover:border-primary/50 hover:bg-muted"
                                )}
                            >
                                <span
                                    className={cn(isSelected ? "text-primary-foreground" : opt.color, "text-xs font-semibold")}>
                                    {opt.label.charAt(0)}
                                </span>
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            </FormField>

            {/* Content */}
            <FormField
                label="Content"
                error={errors.content?.message}
                description="Write in Markdown. Click a template below to get started."
            >
                <div className="flex flex-col gap-3">
                    {/* Template Picker */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-medium shrink-0">Templates:</span>
                        {MARKDOWN_TEMPLATES.map((tpl) => {
                            const Icon = tpl.icon;
                            return (
                                <Button
                                    key={tpl.id}
                                    type="button"
                                    variant="outline"
                                    size="xs"
                                    onClick={() => setValue("content", tpl.content, {shouldValidate: true})}
                                    disabled={isPending}
                                    className="gap-1.5 text-xs h-7"
                                >
                                    <Icon className="size-3.5"/>
                                    {tpl.label}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Split Editor */}
                    <MarkdownSplitEditor
                        value={watchedContent}
                        onChange={(val) => setValue("content", val, {shouldValidate: true})}
                        placeholder="Write your lesson content in Markdown..."
                        disabled={isPending}
                        minHeight="450px"
                    />
                </div>
            </FormField>

            {/* Submit */}
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
