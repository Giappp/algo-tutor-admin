"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Switch} from "@/components/ui/switch";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel,} from "@/components/ui/field";
import {CreateTopicSchema, TopicRequestDTO,} from "@/types/learning-path/schema";

interface TopicFormProps {
    defaultValues?: Partial<TopicRequestDTO>;
    onSubmit: (data: TopicRequestDTO) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
}

export function TopicForm({
                              defaultValues,
                              onSubmit,
                              isPending,
                              submitLabel = "Save",
                          }: TopicFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors},
    } = useForm<TopicRequestDTO>({
        resolver: zodResolver(CreateTopicSchema),
        defaultValues: {
            name: "",
            description: "",
            isLocked: true,
            ...defaultValues,
        },
    });

    const isLocked = watch("isLocked");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FieldGroup className="gap-5">
                <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <FieldContent>
                        <Input
                            id="name"
                            placeholder="e.g. Arrays and Strings"
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
                            placeholder="Brief description of this topic..."
                            className="min-h-20"
                            aria-invalid={!!errors.description}
                            disabled={isPending}
                            {...register("description")}
                        />
                        {errors.description && (
                            <FieldError>{errors.description.message}</FieldError>
                        )}
                    </FieldContent>
                </Field>
                <Field orientation="horizontal">
                    <FieldLabel htmlFor="isLocked">Locked by Default</FieldLabel>
                    <Switch
                        id="isLocked"
                        checked={isLocked}
                        onCheckedChange={(checked) =>
                            setValue("isLocked", checked, {shouldValidate: true})
                        }
                        disabled={isPending}
                    />
                    <FieldDescription>
                        When locked, learners must complete previous topics first.
                    </FieldDescription>
                </Field>
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}