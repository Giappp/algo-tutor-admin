"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {SettingsIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {ImageUpload} from "@/components/ui/image-upload";
import {
    CreateLearningPath,
    CreateLearningPathSchema,
} from "@/types/learning-path/schema";
import {Level} from "@/types/learning-path";

const LEVEL_OPTIONS: {
    value: Level;
    label: string;
    description: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}[] = [
    {
        value: "BEGINNER",
        label: "Beginner",
        description: "New to the topic",
        icon: (
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
            </svg>
        ),
        iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
        iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
        value: "INTERMEDIATE",
        label: "Intermediate",
        description: "Some experience",
        icon: (
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4"/>
                <path d="M12 18v4"/>
                <path d="M4.93 4.93l2.83 2.83"/>
                <path d="M16.24 16.24l2.83 2.83"/>
                <path d="M2 12h4"/>
                <path d="M18 12h4"/>
                <path d="M4.93 19.07l2.83-2.83"/>
                <path d="M16.24 7.76l2.83-2.83"/>
            </svg>
        ),
        iconBg: "bg-amber-100 dark:bg-amber-900/50",
        iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
        value: "ADVANCED",
        label: "Advanced",
        description: "Expert level",
        icon: (
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        ),
        iconBg: "bg-rose-100 dark:bg-rose-900/50",
        iconColor: "text-rose-600 dark:text-rose-400",
    },
];

interface LearningPathFieldsProps {
    control: ReturnType<typeof useForm<CreateLearningPath>>["control"];
    isPending?: boolean;
    errors: ReturnType<typeof useForm<CreateLearningPath>>["formState"]["errors"];
    watch: ReturnType<typeof useForm<CreateLearningPath>>["watch"];
    register: ReturnType<typeof useForm<CreateLearningPath>>["register"];
    setValue: ReturnType<typeof useForm<CreateLearningPath>>["setValue"];
}

function ErrorMessage({message}: { message?: string | object }) {
    if (!message) return null;
    const text = typeof message === "string" ? message : "Invalid value";
    return <div className="text-sm text-destructive">{text}</div>;
}

export function LearningPathFields({
                                      control,
                                      isPending,
                                      errors,
                                      watch,
                                      register,
                                      setValue,
                                  }: LearningPathFieldsProps) {
    const thumbnailUrl = watch("thumbnailUrl");
    const level = watch("level");

    return (
        <FieldGroup className="gap-5">
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
                    {!errors.name && (
                        <FieldDescription>
                            Choose a clear, descriptive name that learners will recognize.
                        </FieldDescription>
                    )}
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
                    {!errors.description && (
                        <FieldDescription>
                            Explain what makes this path unique and who it is for.
                        </FieldDescription>
                    )}
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
                    {!errors.goal && (
                        <FieldDescription>
                            Set clear expectations for the learning outcomes.
                        </FieldDescription>
                    )}
                </FieldContent>
            </Field>

            {/* Level */}
            <Field>
                <FieldLabel>Difficulty Level</FieldLabel>
                <FieldContent>
                    <ToggleGroup
                        value={[level || "BEGINNER"]}
                        onValueChange={(vals) => {
                            if (vals.length > 0) {
                                setValue("level", vals[0] as Level, {shouldValidate: true});
                            }
                        }}
                        className="grid w-full grid-cols-3 gap-3"
                    >
                        {LEVEL_OPTIONS.map((opt) => (
                            <ToggleGroupItem
                                key={opt.value}
                                value={opt.value}
                                aria-label={`${opt.label}: ${opt.description}`}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-3.5 px-2 transition-all",
                                    "data-[state=on]:border-primary data-[state=on]:bg-primary/5",
                                    "data-[state=off]:border-border hover:border-primary/40 hover:bg-muted/50"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex size-10 items-center justify-center rounded-xl transition-transform duration-200",
                                        opt.iconBg,
                                        opt.iconColor,
                                        "data-[state=on]:scale-110"
                                    )}
                                >
                                    {opt.icon}
                                </div>
                                <div className="text-center">
                                    <span className="block text-sm font-semibold">{opt.label}</span>
                                    <span className="block text-[10px] text-muted-foreground">{opt.description}</span>
                                </div>
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    <ErrorMessage message={errors.level?.message}/>
                </FieldContent>
            </Field>

            {/* Advanced Settings */}
            <Collapsible defaultOpen={false}>
                <CollapsibleTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <SettingsIcon data-icon="inline-start" className="size-4"/>
                            Advanced Settings
                        </Button>
                    }
                />

                <CollapsibleContent className="contents space-y-4 pt-4">
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
                </CollapsibleContent>
            </Collapsible>
        </FieldGroup>
    );
}

interface LearningPathFormProps {
    defaultValues?: Partial<CreateLearningPath>;
    onSubmit?: (data: CreateLearningPath) => Promise<void>;
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
    } = useForm<CreateLearningPath>({
        resolver: zodResolver(CreateLearningPathSchema),
        defaultValues: {
            name: "",
            description: "",
            goal: "",
            thumbnailUrl: "",
            level: "BEGINNER",
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
