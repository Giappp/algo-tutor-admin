"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { ImageUpload } from "@/components/ui/image-upload";
import { LevelSelect } from "@/components/ui/level-select";
import {
    CreateLearningPathSchema,
    LearningPathRequestDTO,
} from "@/types/learning-path/schema";
import { Level } from "@/types/learning-path";

interface LearningPathFieldsProps {
    control: ReturnType<typeof useForm<LearningPathRequestDTO>>["control"];
    isPending?: boolean;
    errors: ReturnType<typeof useForm<LearningPathRequestDTO>>["formState"]["errors"];
    watch: ReturnType<typeof useForm<LearningPathRequestDTO>>["watch"];
    register: ReturnType<typeof useForm<LearningPathRequestDTO>>["register"];
    setValue: ReturnType<typeof useForm<LearningPathRequestDTO>>["setValue"];
}

function ErrorMessage({ message }: { message?: string | object }) {
    if (!message) return null;

    const text = typeof message === "string" ? message : "Invalid value";

    return (
        <p className="mt-1 text-xs font-medium text-destructive">
            {text}
        </p>
    );
}

export function LearningPathFields({
    isPending,
    errors,
    watch,
    register,
    setValue,
}: LearningPathFieldsProps) {
    const t = useTranslations("learningPaths");
    const thumbnailUrl = watch("thumbnailUrl");
    const isPremium = watch("isPremium");

    const labelClassName = "text-sm font-semibold text-foreground";
    const inputClassName =
        "w-full min-w-0 text-sm";
    const textareaClassName =
        "w-full min-w-0 resize-y text-sm leading-relaxed";

    return (
        <FieldGroup className="min-w-0 max-w-full gap-5">
            {/* Name */}
            <Field className="min-w-0 space-y-1.5">
                <FieldLabel htmlFor="name" className={labelClassName}>
                    {t("fieldName")}
                </FieldLabel>

                <FieldContent className="min-w-0">
                    <Input
                        id="name"
                        placeholder={t("fieldNamePlaceholder")}
                        aria-invalid={!!errors.name}
                        disabled={isPending}
                        className={inputClassName}
                        {...register("name")}
                    />
                    <ErrorMessage message={errors.name?.message} />
                </FieldContent>
            </Field>

            {/* Description */}
            <Field className="min-w-0 space-y-1.5">
                <FieldLabel htmlFor="description" className={labelClassName}>
                    {t("fieldDescription")}
                </FieldLabel>

                <FieldContent className="min-w-0">
                    <Textarea
                        id="description"
                        placeholder={t("fieldDescriptionPlaceholder")}
                        className={cn(textareaClassName, "min-h-24")}
                        aria-invalid={!!errors.description}
                        disabled={isPending}
                        {...register("description")}
                    />
                    <ErrorMessage message={errors.description?.message} />
                </FieldContent>
            </Field>

            {/* Goal */}
            <Field className="min-w-0 space-y-1.5">
                <FieldLabel htmlFor="goal" className={labelClassName}>
                    {t("fieldGoal")}
                </FieldLabel>

                <FieldContent className="min-w-0">
                    <Textarea
                        id="goal"
                        placeholder={t("fieldGoalPlaceholder")}
                        className={cn(textareaClassName, "min-h-20")}
                        aria-invalid={!!errors.goal}
                        disabled={isPending}
                        {...register("goal")}
                    />
                    <ErrorMessage message={errors.goal?.message} />
                </FieldContent>
            </Field>

            {/* Level */}
            <Field className="min-w-0 space-y-1.5">
                <FieldLabel className={labelClassName}>
                    {t("fieldLevel")}
                </FieldLabel>

                <FieldContent className="min-w-0">
                    <LevelSelect
                        value={watch("level") as Level}
                        onChange={(val) =>
                            setValue("level", val, { shouldValidate: true })
                        }
                        disabled={isPending}
                    />
                    <ErrorMessage message={errors.level?.message} />
                </FieldContent>
            </Field>

            {/* Cover Image */}
            <Field className="min-w-0 space-y-1.5">
                <FieldLabel className={labelClassName}>
                    {t("fieldCoverImage")}
                </FieldLabel>

                <FieldContent className="min-w-0">
                    <div className="min-w-0 max-w-full overflow-x-clip rounded-xl">
                        <ImageUpload
                            value={thumbnailUrl || ""}
                            onChange={(url) =>
                                setValue("thumbnailUrl", url, {
                                    shouldValidate: true,
                                })
                            }
                            onRemove={() =>
                                setValue("thumbnailUrl", "", {
                                    shouldValidate: true,
                                })
                            }
                            disabled={isPending}
                            aspectRatio="video"
                        />
                    </div>

                    <FieldDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {t("fieldCoverImageDesc")}
                    </FieldDescription>

                    <ErrorMessage message={errors.thumbnailUrl?.message} />
                </FieldContent>
            </Field>

            {/* Premium Toggle */}
            <Field className="min-w-0 space-y-1.5">
                <FieldLabel htmlFor="isPremium" className={labelClassName}>
                    {t("fieldAccess")}
                </FieldLabel>

                <FieldContent className="min-w-0">
                    <button
                        id="isPremium"
                        type="button"
                        role="switch"
                        aria-checked={isPremium ?? false}
                        onClick={() =>
                            setValue("isPremium", !isPremium, {
                                shouldValidate: true,
                            })
                        }
                        disabled={isPending}
                        className={cn(
                            "flex w-full min-w-0 items-center justify-between gap-4 rounded-lg border border-border bg-background p-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors",
                            "hover:border-foreground/25 active:scale-[0.99]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                    >
                        <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate text-sm font-semibold text-foreground">
                                {isPremium
                                    ? t("fieldAccessPremium")
                                    : t("fieldAccessFree")}
                            </span>

                            <span className="text-xs leading-relaxed text-muted-foreground">
                                {t("fieldAccess")}
                            </span>
                        </span>

                        <span
                            className={cn(
                                "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                                isPremium
                                    ? "bg-amber-400/90 dark:bg-amber-500/90"
                                    : "bg-muted-foreground/20 dark:bg-muted-foreground/30"
                            )}
                        >
                            <span
                                className={cn(
                                    "pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg transition-transform",
                                    isPremium ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </span>
                    </button>

                    <ErrorMessage message={errors.isPremium?.message} />
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
    submitLabel,
}: LearningPathFormProps) {
    const tCommon = useTranslations("common");

    const {
        control,
        handleSubmit,
        watch,
        register,
        setValue,
        formState: { errors },
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
        if (!onSubmit) return;
        await onSubmit(data);
    });

    return (
        <form
            onSubmit={handleFormSubmit}
            className="flex min-w-0 max-w-full flex-col gap-5 overflow-x-clip"
        >
            <LearningPathFields
                control={control}
                isPending={isPending}
                errors={errors}
                watch={watch}
                register={register}
                setValue={setValue}
            />

            {onSubmit && (
                <div className="flex flex-col-reverse gap-3 border-t border-border/40 pt-4 sm:flex-row sm:justify-end">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="h-10 w-full rounded-xl px-5 text-xs font-bold shadow-sm sm:w-auto"
                    >
                        {isPending
                            ? tCommon("saving")
                            : submitLabel || tCommon("save")}
                    </Button>
                </div>
            )}
        </form>
    );
}
