"use client";

import React, {useCallback, useState} from "react";
import {Control, Controller, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import z from "zod";

import {ProblemDetailAdmin, TagDto} from "@/types/problem";
import {toAppError} from "@/api/core/api-error";
import {DifficultyEnum} from "@/schemas/problem-wizard.schema";
import {useUpdateProblemBasic} from "@/hooks/use-problem";
import {useAdminTags} from "@/hooks/use-tags";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";

import {AlertCircleIcon, ChevronsUpDownIcon, Loader2Icon, SaveIcon, XIcon} from "lucide-react";
import {Tag} from "@/types/tag";

const basicInfoSchema = z.object({
    title: z.string().min(1, "Title is required.").max(200, "Title must be 200 characters or less."),
    statement: z.string().min(10, "Problem statement must be at least 10 characters."),
    difficulty: DifficultyEnum,
    tags: z.array(z.object({id: z.number(), name: z.string()})),
});

type BasicInfoData = z.infer<typeof basicInfoSchema>;

function StatementPreview({control}: Readonly<{ control: Control<BasicInfoData> }>) {
    const statementValue = useWatch({control, name: "statement"});

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

export function BasicInfoTab({problem}: { problem: ProblemDetailAdmin }) {
    const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: {errors, isDirty},
    } = useForm<BasicInfoData>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            title: problem.title,
            statement: problem.statement,
            difficulty: problem.difficulty,
            tags: problem.tags,
        },
    });

    const {data: allTags, isLoading: tagsLoading} = useAdminTags();
    const updateBasicInfoHook = useUpdateProblemBasic(problem.id);

    const updateBasicInfo = {
        isPending: updateBasicInfoHook.isPending,
        mutate: (data: BasicInfoData) => {
            updateBasicInfoHook.mutate(data, {
                onSuccess: () => {
                    setServerError(null);
                },
                onError: (err: unknown) => {
                    const appError = toAppError(err);
                    setServerError(appError.message);
                }
            });
        }
    };

    const onSubmit = (data: BasicInfoData) => {
        updateBasicInfo.mutate(data);
    };

    const selectedTags = useWatch({control, name: "tags"}) || [];
    const selectedTagIds = selectedTags.map((t) => t.id);

    const toggleTag = useCallback(
        (tag: TagDto) => {
            const current = getValues("tags") || [];
            const exists = current.some((t) => t.id === tag.id);
            const next = exists
                ? current.filter((t) => t.id !== tag.id)
                : [...current, {id: tag.id, name: tag.name}];
            setValue("tags", next, {shouldValidate: true, shouldDirty: true});
        },
        [getValues, setValue]
    );

    const removeTag = useCallback(
        (tagId: number) => {
            const current = getValues("tags") || [];
            setValue(
                "tags",
                current.filter((t) => t.id !== tagId),
                {shouldValidate: true, shouldDirty: true}
            );
        },
        [getValues, setValue]
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div>
                    <h2 className="text-lg font-semibold">Basic Information</h2>
                    <p className="text-sm text-muted-foreground">Modify the core details of this problem.</p>
                </div>
                <Button type="submit" disabled={!isDirty || updateBasicInfo.isPending}>
                    {updateBasicInfo.isPending ? (
                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin"/>
                    ) : (
                        <SaveIcon className="w-4 h-4 mr-2"/>
                    )}
                    Save Changes
                </Button>
            </div>

            <FieldGroup className="gap-5 max-w-3xl">
                {serverError && (
                    <div
                        className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                        role="alert">
                        <AlertCircleIcon className="size-4 shrink-0"/>
                        <p>{serverError}</p>
                    </div>
                )}

                <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input id="title" aria-invalid={!!errors.title}
                           disabled={updateBasicInfo.isPending} {...register("title")} />
                    {errors.title && <FieldError>{errors.title.message}</FieldError>}
                </Field>

                <Field>
                    <FieldLabel>Difficulty</FieldLabel>
                    <Controller
                        control={control}
                        name="difficulty"
                        render={({field}) => (
                            <Select value={field.value} onValueChange={(val) => field.onChange(val)}
                                    disabled={updateBasicInfo.isPending}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select difficulty"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EASY"><Badge variant="default" className="px-2 py-0.5 text-xs">Easy</Badge></SelectItem>
                                    <SelectItem value="MEDIUM"><Badge variant="secondary" className="px-2 py-0.5 text-xs">Medium</Badge></SelectItem>
                                    <SelectItem value="HARD"><Badge variant="destructive" className="px-2 py-0.5 text-xs">Hard</Badge></SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.difficulty && <FieldError>{errors.difficulty.message}</FieldError>}
                </Field>

                <Field>
                    <FieldLabel>Tags</FieldLabel>
                    <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                        <PopoverTrigger
                            render={<Button type="button" variant="outline" className="w-full justify-between"
                                            disabled={updateBasicInfo.isPending}/>}>
                            {selectedTags.length > 0 ? `${selectedTags.length} tag(s) selected` : "Select tags…"}
                            <ChevronsUpDownIcon data-icon="inline-end" className="ml-2 shrink-0 opacity-50" />
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0">
                            <Command>
                                <CommandInput placeholder="Search tags…"/>
                                <CommandList>
                                    <CommandEmpty>{tagsLoading ? "Loading…" : "No tags found."}</CommandEmpty>
                                    <CommandGroup>
                                        {allTags !== undefined && allTags.success && allTags.data.map((tag: Tag) => (
                                            <CommandItem key={tag.id} value={tag.name} onSelect={() => toggleTag(tag)}
                                                         data-checked={selectedTagIds.includes(tag.id)}>
                                                {tag.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                            {selectedTags.map((tag) => (
                                <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
                                    {tag.name}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag.id)}
                                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                                    >
                                        <XIcon className="size-3"/>
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </Field>

                <Field>
                    <FieldLabel>Problem Statement</FieldLabel>
                    <FieldDescription>Supports Markdown and LaTeX. Use <code>$...$</code> for inline math
                        and <code>$$...$$</code> for block math.</FieldDescription>
                    <Tabs defaultValue="edit">
                        <TabsList>
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit">
                            <Textarea
                                id="statement"
                                rows={12}
                                className="min-h-60 font-mono text-sm"
                                aria-invalid={!!errors.statement}
                                disabled={updateBasicInfo.isPending}
                                {...register("statement")}
                            />
                        </TabsContent>
                        <TabsContent value="preview">
                            <StatementPreview control={control}/>
                        </TabsContent>
                    </Tabs>
                    {errors.statement && <FieldError>{errors.statement.message}</FieldError>}
                </Field>
            </FieldGroup>
        </form>
    );
}
