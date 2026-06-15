"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
    BookOpenText,
    ImageIcon,
    LockKeyhole,
    Settings2,
    Sparkles,
} from "lucide-react";
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

function ErrorMessage({ id, message }: { id?: string; message?: string | object }) {
    if (!message) return null;

    const text = typeof message === "string" ? message : "Invalid value";

    return (
        <p id={id} role="alert" className="mt-1 text-xs font-medium text-destructive">
            {text}
        </p>
    );
}

function FormSection({
    icon,
    title,
    description,
    children,
    className,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                "min-w-0 rounded-xl border border-border/70 bg-card shadow-[0_12px_32px_-28px_oklch(0.45_0.12_240/0.45)]",
                className
            )}
        >
            <div className="flex items-start gap-3 border-b border-border/60 bg-primary/[0.025] px-4 py-4 sm:px-5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/8 text-primary">
                    {icon}
                </span>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
                </div>
            </div>
            <div className="p-4 sm:p-5">{children}</div>
        </section>
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
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]">
            <FormSection
                icon={<BookOpenText className="size-4" />}
                title={t("formContentTitle")}
                description={t("formContentDescription")}
            >
                <FieldGroup className="min-w-0 max-w-full gap-5">
                    <Field className="min-w-0 space-y-1.5">
                        <FieldLabel htmlFor="name" className={labelClassName}>{t("fieldName")}</FieldLabel>
                        <FieldContent className="min-w-0">
                            <Input
                                id="name"
                                placeholder={t("fieldNamePlaceholder")}
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? "name-error" : undefined}
                                disabled={isPending}
                                className={cn(inputClassName, "h-11")}
                                {...register("name")}
                            />
                            <ErrorMessage id="name-error" message={errors.name?.message} />
                        </FieldContent>
                    </Field>

                    <Field className="min-w-0 space-y-1.5">
                        <FieldLabel htmlFor="description" className={labelClassName}>{t("fieldDescription")}</FieldLabel>
                        <FieldContent className="min-w-0">
                            <Textarea
                                id="description"
                                placeholder={t("fieldDescriptionPlaceholder")}
                                className={cn(textareaClassName, "min-h-28")}
                                aria-invalid={!!errors.description}
                                aria-describedby={errors.description ? "description-error" : undefined}
                                disabled={isPending}
                                {...register("description")}
                            />
                            <ErrorMessage id="description-error" message={errors.description?.message} />
                        </FieldContent>
                    </Field>

                    <Field className="min-w-0 space-y-1.5">
                        <FieldLabel htmlFor="goal" className={labelClassName}>{t("fieldGoal")}</FieldLabel>
                        <FieldContent className="min-w-0">
                            <Textarea
                                id="goal"
                                placeholder={t("fieldGoalPlaceholder")}
                                className={cn(textareaClassName, "min-h-28")}
                                aria-invalid={!!errors.goal}
                                aria-describedby={errors.goal ? "goal-error" : undefined}
                                disabled={isPending}
                                {...register("goal")}
                            />
                            <ErrorMessage id="goal-error" message={errors.goal?.message} />
                        </FieldContent>
                    </Field>
                </FieldGroup>
            </FormSection>

            <div className="min-w-0 space-y-5 lg:sticky lg:top-5">
                <FormSection
                    icon={<ImageIcon className="size-4" />}
                    title={t("formPresentationTitle")}
                    description={t("formPresentationDescription")}
                >
                    <Field className="min-w-0 space-y-1.5">
                        <FieldLabel className={labelClassName}>{t("fieldCoverImage")}</FieldLabel>
                        <FieldContent className="min-w-0">
                            <div className="min-w-0 max-w-full overflow-x-clip rounded-lg">
                                <ImageUpload
                                    value={thumbnailUrl || ""}
                                    onChange={(url) => setValue("thumbnailUrl", url, {shouldValidate: true, shouldDirty: true})}
                                    onRemove={() => setValue("thumbnailUrl", "", {shouldValidate: true, shouldDirty: true})}
                                    disabled={isPending}
                                    aspectRatio="video"
                                />
                            </div>
                            <FieldDescription className="mt-1">{t("fieldCoverImageDesc")}</FieldDescription>
                            <ErrorMessage message={errors.thumbnailUrl?.message} />
                        </FieldContent>
                    </Field>
                </FormSection>

                <FormSection
                    icon={<Settings2 className="size-4" />}
                    title={t("formSettingsTitle")}
                    description={t("formSettingsDescription")}
                >
                    <FieldGroup className="min-w-0 max-w-full gap-5">
                        <Field className="min-w-0 space-y-1.5">
                            <FieldLabel className={labelClassName}>{t("fieldLevel")}</FieldLabel>
                            <FieldContent className="min-w-0">
                                <LevelSelect
                                    value={watch("level") as Level}
                                    onChange={(val) => setValue("level", val, {shouldValidate: true, shouldDirty: true})}
                                    disabled={isPending}
                                />
                                <ErrorMessage message={errors.level?.message} />
                            </FieldContent>
                        </Field>

                        <Field className="min-w-0 space-y-1.5">
                            <FieldLabel htmlFor="isPremium" className={labelClassName}>{t("fieldAccess")}</FieldLabel>
                            <FieldContent className="min-w-0">
                                <button
                                    id="isPremium"
                                    type="button"
                                    role="switch"
                                    aria-checked={isPremium ?? false}
                                    onClick={() => setValue("isPremium", !isPremium, {shouldValidate: true, shouldDirty: true})}
                                    disabled={isPending}
                                    className={cn(
                                        "flex w-full min-w-0 items-center gap-3 rounded-lg border p-3 text-left transition-all",
                                        "border-border bg-background hover:border-primary/30 hover:bg-primary/[0.025] active:translate-y-px",
                                        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
                                        isPremium && "border-primary/30 bg-primary/[0.045]",
                                        "disabled:cursor-not-allowed disabled:opacity-50"
                                    )}
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                                        {isPremium ? <Sparkles className="size-4" /> : <LockKeyhole className="size-4" />}
                                    </span>
                                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                        <span className="text-sm font-semibold text-foreground">{isPremium ? t("premium") : t("free")}</span>
                                        <span className="text-xs leading-relaxed text-muted-foreground">
                                            {isPremium ? t("fieldAccessPremium") : t("fieldAccessFree")}
                                        </span>
                                    </span>
                                    <span className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors", isPremium ? "bg-primary" : "bg-muted-foreground/25")}>
                                        <span className={cn("pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform", isPremium ? "translate-x-5" : "translate-x-0")} />
                                    </span>
                                </button>
                                <ErrorMessage message={errors.isPremium?.message} />
                            </FieldContent>
                        </Field>
                    </FieldGroup>
                </FormSection>
            </div>
        </div>
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
