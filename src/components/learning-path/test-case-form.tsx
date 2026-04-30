"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel,} from "@/components/ui/field";
import {CreateTestCase, CreateTestCaseSchema,} from "@/types/learning-path/schema";

interface TestCaseFormProps {
    defaultValues?: Partial<CreateTestCase>;
    onSubmit: (data: CreateTestCase) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
}

export function TestCaseForm({
                                 defaultValues,
                                 onSubmit,
                                 isPending,
                                 submitLabel = "Save Test Case",
                                 onCancel,
                             }: TestCaseFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors},
    } = useForm<CreateTestCase>({
        resolver: zodResolver(CreateTestCaseSchema),
        defaultValues: {
            stdin: "",
            expectedStdout: "",
            isHidden: false,
            explanation: "",
            ...defaultValues,
        },
    });

    const isHidden = watch("isHidden");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FieldGroup className="gap-5">
                <Field>
                    <FieldLabel htmlFor="stdin">Standard Input (stdin)</FieldLabel>
                    <FieldContent>
                        <Textarea
                            id="stdin"
                            placeholder={"2 7 11 15\n9"}
                            className="min-h-20 font-mono text-sm"
                            aria-invalid={!!errors.stdin}
                            disabled={isPending}
                            {...register("stdin")}
                        />
                        <FieldDescription>
                            Input to feed to the program (newline-separated values).
                        </FieldDescription>
                        {errors.stdin && (
                            <FieldError>{errors.stdin.message}</FieldError>
                        )}
                    </FieldContent>
                </Field>

                <Field>
                    <FieldLabel htmlFor="expectedStdout">Expected Output</FieldLabel>
                    <FieldContent>
                        <Textarea
                            id="expectedStdout"
                            placeholder={"0 1"}
                            className="min-h-20 font-mono text-sm"
                            aria-invalid={!!errors.expectedStdout}
                            disabled={isPending}
                            {...register("expectedStdout")}
                        />
                        <FieldDescription>
                            The expected stdout result from running the program.
                        </FieldDescription>
                        {errors.expectedStdout && (
                            <FieldError>{errors.expectedStdout.message}</FieldError>
                        )}
                    </FieldContent>
                </Field>

                <Field>
                    <FieldLabel htmlFor="explanation">Explanation</FieldLabel>
                    <FieldContent>
                        <Textarea
                            id="explanation"
                            placeholder="Why this test case validates the solution..."
                            className="min-h-16"
                            disabled={isPending}
                            {...register("explanation")}
                        />
                        <FieldDescription>
                            Visible to admins only. Shown to learners if not hidden.
                        </FieldDescription>
                    </FieldContent>
                </Field>

                <Field orientation="horizontal">
                    <FieldLabel htmlFor="isHidden">Hidden</FieldLabel>
                    <Switch
                        id="isHidden"
                        checked={isHidden}
                        onCheckedChange={(checked) =>
                            setValue("isHidden", checked, {shouldValidate: true})
                        }
                        disabled={isPending}
                    />
                    <FieldDescription>
                        Hidden test cases are not shown to learners.
                    </FieldDescription>
                </Field>
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
