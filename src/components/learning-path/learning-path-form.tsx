"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Field, FieldContent, FieldDescription, FieldGroup, FieldLabel,} from "@/components/ui/field";
import {ImageUpload} from "@/components/ui/image-upload";
import {LevelSelect} from "@/components/ui/level-select";
import {CreateLearningPathSchema, LearningPathRequestDTO,} from "@/types/learning-path/schema";
import {Level} from "@/types/learning-path";

interface LearningPathFieldsProps {
    control: ReturnType<typeof useForm<LearningPathRequestDTO>>["control"];
    isPending?: boolean;
    errors: ReturnType<typeof useForm<LearningPathRequestDTO>>["formState"]["errors"];
    watch: ReturnType<typeof useForm<LearningPathRequestDTO>>["watch"];
    register: ReturnType<typeof useForm<LearningPathRequestDTO>>["register"];
    setValue: ReturnType<typeof useForm<LearningPathRequestDTO>>["setValue"];
}

function ErrorMessage({message}: { message?: string | object }) {
    if (!message) return null;
    const text = typeof message === "string" ? message : "Invalid value";
    return <div className="text-sm text-destructive">{text}</div>;
}

export function LearningPathFields({
                                       isPending,
                                       errors,
                                       watch,
                                       register,
                                       setValue,
                                   }: LearningPathFieldsProps) {
    const thumbnailUrl = watch("thumbnailUrl");
    const isPremium = watch("isPremium");

    return (
        <FieldGroup className="gap-6">
            {/* Name */}
            <Field>
                <FieldLabel htmlFor="name">Path Name</FieldLabel>
                <FieldContent>
                    <Input
                        id="name"
                        placeholder="e.g. Data Structures Fundamentals"
                        aria-invalid={!!errors.name}
                        disabled={isPending}
                        {...register("name")}
                    />
                    <ErrorMessage message={errors.name?.message}/>
                </FieldContent>
            </Field>

            {/* Description */}
            <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <FieldContent>
                    <Textarea
                        id="description"
                        placeholder="A concise summary of what learners will gain from this path..."
                        className="min-h-24"
                        aria-invalid={!!errors.description}
                        disabled={isPending}
                        {...register("description")}
                    />
                    <ErrorMessage message={errors.description?.message}/>
                </FieldContent>
            </Field>

            {/* Goal */}
            <Field>
                <FieldLabel htmlFor="goal">Learning Goal</FieldLabel>
                <FieldContent>
                    <Textarea
                        id="goal"
                        placeholder="What will learners achieve by completing this path? What skills will they gain?"
                        className="min-h-20"
                        aria-invalid={!!errors.goal}
                        disabled={isPending}
                        {...register("goal")}
                    />
                    <ErrorMessage message={errors.goal?.message}/>
                </FieldContent>
            </Field>

            {/* Level */}
            <Field>
                <FieldLabel>Difficulty Level</FieldLabel>
                <FieldContent>
                    <LevelSelect
                        value={watch("level") as Level}
                        onChange={(val) => setValue("level", val, {shouldValidate: true})}
                        disabled={isPending}
                    />
                    <ErrorMessage message={errors.level?.message}/>
                </FieldContent>
            </Field>

            {/* Cover Image */}
            <Field>
                <FieldLabel>Cover Image</FieldLabel>
                <FieldContent>
                    <ImageUpload
                        value={thumbnailUrl || ""}
                        onChange={(url) => setValue("thumbnailUrl", url, {shouldValidate: true})}
                        onRemove={() => setValue("thumbnailUrl", "", {shouldValidate: true})}
                        disabled={isPending}
                        aspectRatio="video"
                    />
                    <FieldDescription>
                        Upload a 16:9 image to represent this learning path visually.
                    </FieldDescription>
                    <ErrorMessage message={errors.thumbnailUrl?.message}/>
                </FieldContent>
            </Field>

            {/* Premium Toggle */}
            <Field>
                <FieldLabel htmlFor="isPremium">Access</FieldLabel>
                <FieldContent>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isPremium ?? false}
                        onClick={() => setValue("isPremium", !isPremium, {shouldValidate: true})}
                        disabled={isPending}
                        className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            isPremium
                                ? "bg-amber-400/90 dark:bg-amber-500/90"
                                : "bg-muted-foreground/20 dark:bg-muted-foreground/30"
                        )}
                    >
                        <span
                            className={cn(
                                "pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                                isPremium ? "translate-x-5" : "translate-x-0"
                            )}
                        />
                    </button>
                    <FieldDescription>
                        {isPremium
                            ? "This path is exclusive to premium subscribers."
                            : "This path is free and accessible to all learners."}
                    </FieldDescription>
                </FieldContent>
            </Field>
        </FieldGroup>
    );
}

interface LearningPathFormProps {
    defaultValues?: Partial<LearningPathRequestDTO>;
    onSubmit?: (data: LearningPathRequestDTO) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
}

export function LearningPathForm({
                                     defaultValues,
                                     onSubmit,
                                     isPending,
                                     submitLabel = "Save",
                                 }: LearningPathFormProps) {
    const {
        control,
        handleSubmit,
        watch,
        register,
        setValue,
        formState: {errors},
    } = useForm<LearningPathRequestDTO>({
        resolver: zodResolver(CreateLearningPathSchema),
        defaultValues: {
            name: "",
            description: "",
            goal: "",
            thumbnailUrl: "",
            level: "BEGINNER",
            isPremium: false,
            ...defaultValues,
        },
    });

    const handleFormSubmit = handleSubmit(async (data) => {
        if (onSubmit) {
            await onSubmit(data);
        }
    });

    return (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
            <LearningPathFields
                control={control}
                isPending={isPending}
                errors={errors}
                watch={watch}
                register={register}
                setValue={setValue}
            />
            {onSubmit && (
                <div className="flex justify-end gap-3 pt-2">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : submitLabel}
                    </Button>
                </div>
            )}
        </form>
    );
}
