"use client";

import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ChevronDownIcon, ChevronUpIcon, SettingsIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {
    CreateLearningPathSchema,
    CreateLearningPath,
} from "@/types/learning-path/schema";
import {Level} from "@/types/learning-path";

interface LearningPathFormProps {
    defaultValues?: Partial<CreateLearningPath>;
    onSubmit: (data: CreateLearningPath) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    showPreview?: boolean;
}

const LEVEL_OPTIONS: {value: Level; label: string; description: string}[] = [
    {value: "BEGINNER", label: "Beginner", description: "New to the topic"},
    {value: "INTERMEDIATE", label: "Intermediate", description: "Some experience"},
    {value: "ADVANCED", label: "Advanced", description: "Expert level"},
];

export function LearningPathForm({
    defaultValues,
    onSubmit,
    isPending,
    submitLabel = "Save",
    showPreview = false,
}: LearningPathFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        control,
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

    const watchedValues = useWatch({control});

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FieldGroup className="gap-5">
                <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <FieldContent>
                        <Input
                            id="name"
                            placeholder="e.g. Data Structures Fundamentals"
                            aria-invalid={!!errors.name}
                            disabled={isPending}
                            {...register("name")}
                        />
                        {errors.name && (
                            <FieldError>{errors.name.message}</FieldError>
                        )}
                    </FieldContent>
                </Field>

                <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <FieldContent>
                        <Textarea
                            id="description"
                            placeholder="A concise description of this learning path..."
                            className="min-h-24"
                            aria-invalid={!!errors.description}
                            disabled={isPending}
                            {...register("description")}
                        />
                        {errors.description && (
                            <FieldError>{errors.description.message}</FieldError>
                        )}
                    </FieldContent>
                </Field>

                {/* Level ToggleGroup */}
                <Field>
                    <FieldLabel>Level</FieldLabel>
                    <FieldContent>
                        <ToggleGroup
                            value={[watchedValues.level || "BEGINNER"]}
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
                                        "flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 transition-all",
                                        "data-[state=on]:border-primary data-[state=on]:bg-primary/5",
                                        "data-[state=off]:border-border hover:border-primary/50 hover:bg-muted/50"
                                    )}
                                >
                                    <span className="text-sm font-semibold">{opt.label}</span>
                                    <span className="text-[10px] text-muted-foreground">{opt.description}</span>
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                        {errors.level && (
                            <FieldError>{errors.level.message}</FieldError>
                        )}
                    </FieldContent>
                </Field>

                {/* Advanced Settings Collapsible */}
                <Collapsible defaultOpen={false}>
                    <CollapsibleTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <SettingsIcon data-icon="inline-start" className="size-4" />
                                Advanced Settings
                                <ChevronDownIcon className="size-4 transition-transform data-[state=open]:rotate-180" />
                            </Button>
                        }
                    />

                    <CollapsibleContent className="contents space-y-4 pt-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                        <Field>
                            <FieldLabel htmlFor="goal">Learning Goal</FieldLabel>
                            <FieldContent>
                                <Textarea
                                    id="goal"
                                    placeholder="What will learners achieve by completing this path?"
                                    className="min-h-20"
                                    aria-invalid={!!errors.goal}
                                    disabled={isPending}
                                    {...register("goal")}
                                />
                                {errors.goal && (
                                    <FieldError>{errors.goal.message}</FieldError>
                                )}
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="thumbnailUrl">
                                Thumbnail URL
                            </FieldLabel>
                            <FieldContent>
                                <Input
                                    id="thumbnailUrl"
                                    type="url"
                                    placeholder="https://example.com/thumbnail.jpg"
                                    aria-invalid={!!errors.thumbnailUrl}
                                    disabled={isPending}
                                    {...register("thumbnailUrl")}
                                />
                                {errors.thumbnailUrl && (
                                    <FieldError>{errors.thumbnailUrl.message}</FieldError>
                                )}
                                <FieldDescription>
                                    Optional. Leave blank to use a default thumbnail.
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    </CollapsibleContent>
                </Collapsible>
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
