"use client";

import {useCallback, useEffect, useState} from "react";
import {Control, Controller, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import slugify from "slugify";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import {type BasicInfo, BasicProblemInfoSchema} from "@/schemas/problem-wizard.schema";
import {useProblemDraftStore} from "@/store/problem-wizard.store";
import {toAppError} from "@/api/core/api-error";
import {useCreateProblem} from "@/hooks/use-problem";
import {useAdminTags, useCreateTag} from "@/hooks/use-tags";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";

import {
    AlertCircleIcon,
    ChevronRightIcon,
    ChevronsUpDownIcon,
    FileTextIcon,
    Loader2Icon,
    PlusIcon,
    XIcon
} from "lucide-react";
import {Tag} from "@/types/tag";

function StatementPreview({control}: Readonly<{ control: Control<BasicInfo> }>) {
    const statementValue = useWatch({control, name: "statement"});

    return (
        <div
            className="p-4 h-full prose prose-sm dark:prose-invert max-w-none break-words overflow-wrap-anywhere overflow-x-auto">
            {statementValue ? (
                <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                >
                    {statementValue}
                </ReactMarkdown>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-2 mt-20">
                    <FileTextIcon className="size-10"/>
                    <p className="italic text-sm">Preview will appear here...</p>
                </div>
            )}
        </div>
    );
}

export function Step1Basic({onNext}: Readonly<{ onNext: () => void }>) {
    const {step1Data, setStep1, setProblemId} = useProblemDraftStore();
    const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: {errors},
    } = useForm<BasicInfo>({
        resolver: zodResolver(BasicProblemInfoSchema),
        defaultValues: step1Data ?? {
            title: "",
            slug: "",
            statement: "",
            difficulty: "EASY",
            tags: [],
        },
    });

    const formValues = useWatch({control});

    useEffect(() => {
        if (formValues.title !== undefined) {
            setStep1(formValues as BasicInfo);
        }
    }, [formValues, setStep1]);

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const {data: tags, isLoading: tagsLoading} = useAdminTags();
    const createTagMutation = useCreateTag();

    const createProblem = useCreateProblem();

    const onSubmit = useCallback(
        async (data: BasicInfo) => {
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

    const selectedTags = useWatch({control, name: "tags"}) || [];
    const selectedTagIds = selectedTags.map((t) => t.id);
    const [searchValue, setSearchValue] = useState("");
    const [isCreatingTag, setIsCreatingTag] = useState(false);

    const exactMatch = tags?.some(
        (tag: Tag) => tag.name.toLowerCase() === searchValue.trim().toLowerCase()
    );

    const handleCreateTag = async (newTagName: string) => {
        const trimmedName = newTagName.trim();
        if (!trimmedName) return;
        setIsCreatingTag(true);
        try {
            // Gọi API thật thông qua mutation
            const createdTag = await createTagMutation.mutateAsync(trimmedName);

            const current = getValues("tags") || [];
            setValue(
                "tags",
                [...current, {id: createdTag.id, name: createdTag.name}],
                {shouldValidate: true}
            );

            setSearchValue("");
        } catch (error) {
            console.error("Lỗi khi tạo tag:", error);
        }
    };

    const toggleTag = useCallback(
        (tag: Tag) => {
            const current = getValues("tags") || [];
            const exists = current.some((t) => t.id === tag.id);
            const next = exists
                ? current.filter((t) => t.id !== tag.id)
                : [...current, {id: tag.id, name: tag.name}];
            setValue("tags", next, {shouldValidate: true});
        },
        [getValues, setValue]
    );

    const removeTag = useCallback(
        (tagId: number) => {
            const current = getValues("tags") || [];
            setValue(
                "tags",
                current.filter((t) => t.id !== tagId),
                {shouldValidate: true}
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
                        <AlertCircleIcon className="size-4 shrink-0"/>
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
                        {...register("title", {
                            onChange: (e) => {
                                const newTitle = e.target.value;
                                if (!slugManuallyEdited && newTitle) {
                                    const generated = slugify(newTitle, {lower: true, strict: true});
                                    setValue("slug", generated, {shouldValidate: true});
                                }
                            }
                        })}
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
                        render={({field}) => (
                            <Select
                                value={field.value}
                                onValueChange={(val) => field.onChange(val)}
                                disabled={createProblem.isPending}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select difficulty"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EASY">
                                        <span className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-emerald-500"/>Easy
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="MEDIUM">
                                        <span className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-amber-500"/>Medium
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="HARD">
                                        <span className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-red-500"/>Hard
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
                            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50"/>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0">
                            <Command filter={(value, search) => {
                                if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                                return 0;
                            }}>
                                <CommandInput
                                    placeholder="Search or create tags…"
                                    value={searchValue}
                                    onValueChange={setSearchValue}
                                />
                                <CommandList>
                                    <CommandEmpty>
                                        {tagsLoading || tags == null ? (
                                            "Loading…"
                                        ) : (
                                            searchValue.trim() !== "" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCreateTag(searchValue)}
                                                    disabled={isCreatingTag}
                                                    className="flex w-full items-center gap-2 rounded-sm px-4 py-2 text-sm text-primary hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    {isCreatingTag ? (
                                                        <Loader2Icon className="size-4 animate-spin"/>
                                                    ) : (
                                                        <PlusIcon className="size-4"/>
                                                    )}
                                                    Create &#34;{searchValue.trim()}&#34;
                                                </button>
                                            ) : (
                                                "No tags found."
                                            )
                                        )}
                                    </CommandEmpty>

                                    <CommandGroup>
                                        {tags !== undefined &&
                                            tags.map((tag: Tag) => (
                                                <CommandItem
                                                    key={tag.id}
                                                    value={tag.name}
                                                    onSelect={() => {
                                                        toggleTag(tag);
                                                        setSearchValue("");
                                                    }}
                                                    data-checked={selectedTagIds.includes(tag.id)}
                                                >
                                                    {tag.name}
                                                </CommandItem>
                                            ))}

                                        {/* Nút Create xuất hiện ở cuối list nếu chưa có Tag nào khớp chính xác */}
                                        {!exactMatch && searchValue.trim() !== "" && tags && tags.length > 0 && (
                                            <CommandItem
                                                value={`create-${searchValue}`} // Value phải chứa searchValue để không bị cmdk ẩn đi
                                                onSelect={() => handleCreateTag(searchValue)}
                                                disabled={isCreatingTag}
                                                className="font-medium text-primary border-t rounded-none mt-1 pt-2 cursor-pointer"
                                            >
                                                {isCreatingTag ? (
                                                    <Loader2Icon className="mr-2 size-4 animate-spin"/>
                                                ) : (
                                                    <PlusIcon className="mr-2 size-4"/>
                                                )}
                                                Create &#34;{searchValue.trim()} &#34;
                                            </CommandItem>
                                        )}
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
                                        <XIcon className="size-3"/>
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </Field>

                {/* Statement (Markdown + LaTeX) */}
                <Field className="max-w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <FieldLabel>Problem Statement</FieldLabel>
                            <FieldDescription>
                                Supports Markdown and LaTeX. Use <code>$...$</code> for inline, <code>$$...$$</code> for
                                block.
                            </FieldDescription>
                        </div>
                    </div>

                    {/* Giao diện Mobile: Giữ nguyên Tabs */}
                    <div className="block lg:hidden">
                        <Tabs defaultValue="edit">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="edit">Edit</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                            </TabsList>
                            <TabsContent value="edit">
                                <Textarea
                                    id="statement"
                                    rows={12}
                                    className="min-h-[400px] font-mono text-sm"
                                    disabled={createProblem.isPending}
                                    {...register("statement")}
                                />
                            </TabsContent>
                            <TabsContent value="preview">
                                <StatementPreview control={control}/>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Giao diện Desktop: Split-pane (2 cột song song) */}
                    <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
                        <div className="flex flex-col gap-2">
                            <div
                                className="text-sm font-medium text-muted-foreground bg-muted py-1.5 px-3 rounded-md">Editor
                            </div>
                            <Textarea
                                id="statement-desktop"
                                rows={20}
                                className="min-h-[500px] font-mono text-sm resize-none"
                                disabled={createProblem.isPending}
                                {...register("statement")}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div
                                className="text-sm font-medium text-muted-foreground bg-muted py-1.5 px-3 rounded-md">Live
                                Preview
                            </div>
                            <div className="h-[500px] overflow-y-auto rounded-md border bg-muted/30">
                                <StatementPreview control={control}/>
                            </div>
                        </div>
                    </div>

                    {errors.statement && <FieldError>{errors.statement.message}</FieldError>}
                </Field>
            </FieldGroup>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={createProblem.isPending}>
                    {createProblem.isPending ? (
                        <>
                            <Loader2Icon className="animate-spin"/>
                            Creating…
                        </>
                    ) : (
                        <>
                            Next: Test Cases & Solutions
                            <ChevronRightIcon/>
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}