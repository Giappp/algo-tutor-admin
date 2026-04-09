"use client";

import { useCallback, useEffect, useState } from "react";
import { Control, Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import slugify from "slugify";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { type Step1Data, step1Schema } from "@/schemas/problem-wizard.schema";
import { useProblemDraftStore } from "@/store/problem-wizard.store";
import { get, post } from "@/api/http";
import { toAppError } from "@/api/api-error";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

import { AlertCircleIcon, ChevronRightIcon, ChevronsUpDownIcon, Loader2Icon, XIcon } from "lucide-react";

type Tag = { id: number; name: string };

function StatementPreview({ control }: Readonly<{ control: Control<Step1Data> }>) {
    const statementValue = useWatch({ control, name: "statement" });

    return (
        <div
            className="rounded-xl border border-input bg-input/10 p-4 min-h-60 prose prose-sm dark:prose-invert max-w-none">
            {statementValue ? (
                <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                >
                    {statementValue}
                </ReactMarkdown>
            ) : (
                <p className="text-muted-foreground italic">
                    Nothing to preview. Start typing in the Edit tab.
                </p>
            )}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────
export function Step1Basic({ onNext }: Readonly<{ onNext: () => void }>) {
    const { step1Data, setStep1, setProblemId } = useProblemDraftStore();
    const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
        defaultValues: step1Data ?? {
            title: "",
            slug: "",
            statement: "",
            difficulty: "EASY",
            tags: [],
        },
    });

    const formValues = useWatch({ control });

    useEffect(() => {
        if (formValues.title !== undefined) {
            setStep1(formValues as Step1Data);
        }
    }, [formValues, setStep1]);

    const titleValue = useWatch({ control, name: "title" });
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    useEffect(() => {
        if (slugManuallyEdited || !titleValue) return;
        const timeout = setTimeout(() => {
            const generated = slugify(titleValue, { lower: true, strict: true });
            setValue("slug", generated, { shouldValidate: true });
        }, 300);
        return () => clearTimeout(timeout);
    }, [titleValue, slugManuallyEdited, setValue]);

    // ── Fetch tags ─────────────────────────────────────────────
    const { data: tags = [], isLoading: tagsLoading } = useQuery<Tag[]>({
        queryKey: ["admin-tags"],
        queryFn: () => get<Tag[]>("/api/v1/admin/tags"),
    });

    // ── Submit mutation ────────────────────────────────────────
    const createProblem = useMutation({
        mutationFn: async (data: Step1Data) => {
            return post<{ id: number }>("/api/v1/admin/problems", data);
        },
    });

    const onSubmit = useCallback(
        async (data: Step1Data) => {
            try {
                setServerError(null);
                const result = await createProblem.mutateAsync(data);
                setStep1(data);
                setProblemId(result.id);
                onNext();
            } catch (error) {
                const appError = toAppError(error);
                setServerError(appError.message);
            }
        },
        [createProblem, setStep1, setProblemId, onNext]
    );

    // ── Selected tags helper ────────────────────────────────────
    const selectedTags = useWatch({ control, name: "tags" }) || [];
    const selectedTagIds = selectedTags.map((t) => t.id);

    const toggleTag = useCallback(
        (tag: Tag) => {
            const current = getValues("tags") || [];
            const exists = current.some((t) => t.id === tag.id);
            const next = exists
                ? current.filter((t) => t.id !== tag.id)
                : [...current, { id: tag.id, name: tag.name }];
            setValue("tags", next, { shouldValidate: true });
        },
        [getValues, setValue]
    );

    const removeTag = useCallback(
        (tagId: number) => {
            const current = getValues("tags") || [];
            setValue(
                "tags",
                current.filter((t) => t.id !== tagId),
                { shouldValidate: true }
            );
        },
        [getValues, setValue]
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup className="gap-5">
                {/* Server Error */}
                {serverError && (
                    <div
                        className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300"
                        role="alert"
                    >
                        <AlertCircleIcon className="size-4 shrink-0" />
                        <p>{serverError}</p>
                    </div>
                )}

                {/* Title */}
                <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                        id="title"
                        placeholder="e.g. Two Sum"
                        aria-invalid={!!errors.title}
                        disabled={createProblem.isPending}
                        {...register("title")}
                    />
                    {errors.title && <FieldError>{errors.title.message}</FieldError>}
                </Field>

                {/* Slug */}
                <Field>
                    <FieldLabel htmlFor="slug">Slug</FieldLabel>
                    <FieldDescription>
                        Auto-generated from title. You can edit it manually.
                    </FieldDescription>
                    <Input
                        id="slug"
                        placeholder="e.g. two-sum"
                        aria-invalid={!!errors.slug}
                        disabled={createProblem.isPending}
                        {...register("slug", {
                            onChange: () => setSlugManuallyEdited(true),
                        })}
                    />
                    {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
                </Field>

                {/* Difficulty */}
                <Field>
                    <FieldLabel>Difficulty</FieldLabel>
                    <Controller
                        control={control}
                        name="difficulty"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={(val) => field.onChange(val)}
                                disabled={createProblem.isPending}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EASY">
                                        <span className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-emerald-500" />Easy
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="MEDIUM">
                                        <span className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-amber-500" />Medium
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="HARD">
                                        <span className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-red-500" />Hard
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.difficulty && (
                        <FieldError>{errors.difficulty.message}</FieldError>
                    )}
                </Field>

                {/* Tags */}
                <Field>
                    <FieldLabel>Tags</FieldLabel>
                    {/* ADDED: asChild here */}
                    <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                        <PopoverTrigger
                            render={
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between"
                                    disabled={createProblem.isPending}
                                />
                            }
                        >
                            {selectedTags.length > 0
                                ? `${selectedTags.length} tag(s) selected`
                                : "Select tags…"}
                            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0">
                            <Command>
                                <CommandInput placeholder="Search tags…" />
                                <CommandList>
                                    <CommandEmpty>
                                        {tagsLoading ? "Loading…" : "No tags found."}
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {tags.map((tag) => (
                                            <CommandItem
                                                key={tag.id}
                                                value={tag.name}
                                                onSelect={() => toggleTag(tag)}
                                                data-checked={selectedTagIds.includes(tag.id)}
                                            >
                                                {tag.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {/* Selected tag badges */}
                    {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                            {selectedTags.map((tag) => (
                                <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
                                    {tag.name}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag.id)}
                                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                                        aria-label={`Remove ${tag.name}`}
                                    >
                                        <XIcon className="size-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </Field>

                {/* Statement (Markdown + LaTeX) */}
                <Field>
                    <FieldLabel>Problem Statement</FieldLabel>
                    <FieldDescription>
                        Supports Markdown and LaTeX. Use <code>$...$</code> for inline math
                        and <code>$$...$$</code> for block math.
                    </FieldDescription>
                    <Tabs defaultValue="edit">
                        <TabsList>
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit">
                            <Textarea
                                id="statement"
                                rows={12}
                                placeholder={`# Two Sum\n\nGiven an array of integers **nums** and an integer **target**, return indices of the two numbers such that they add up to target.\n\n## Constraints\n- $2 \\leq n \\leq 10^4$\n- $-10^9 \\leq nums[i] \\leq 10^9$`}
                                className="min-h-60 font-mono text-sm"
                                aria-invalid={!!errors.statement}
                                disabled={createProblem.isPending}
                                {...register("statement")}
                            />
                        </TabsContent>
                        <TabsContent value="preview">
                            {/* Uses the isolated component */}
                            <StatementPreview control={control} />
                        </TabsContent>
                    </Tabs>
                    {errors.statement && (
                        <FieldError>{errors.statement.message}</FieldError>
                    )}
                </Field>
            </FieldGroup>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={createProblem.isPending}>
                    {createProblem.isPending ? (
                        <>
                            <Loader2Icon className="animate-spin" />
                            Creating…
                        </>
                    ) : (
                        <>
                            Next: Test Cases & Solutions
                            <ChevronRightIcon />
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}