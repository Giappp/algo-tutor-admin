"use client";

import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Field, FieldContent, FieldError, FieldGroup, FieldLabel,} from "@/components/ui/field";
import {CreateEditorialSchema, EditorialRequestDTO,} from "@/types/learning-path/schema";
import {ProgrammingLanguage} from "@/types/learning-path";

const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="h-64 rounded-xl border border-input bg-muted animate-pulse"/>
        ),
    }
);

interface EditorialFormProps {
    defaultValues?: Partial<EditorialRequestDTO>;
    onSubmit: (data: EditorialRequestDTO) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
}

const LANGUAGE_OPTIONS: { value: ProgrammingLanguage; label: string }[] = [
    {value: "JAVA", label: "Java"},
    {value: "PYTHON", label: "Python"},
    {value: "CPP", label: "C++"},
];

const LANGUAGE_MAP: Record<ProgrammingLanguage, string> = {
    JAVA: "java",
    PYTHON: "python",
    CPP: "cpp",
};

export function EditorialForm({
                                  defaultValues,
                                  onSubmit,
                                  isPending,
                                  submitLabel = "Save Editorial",
                                  onCancel,
                              }: EditorialFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: {errors},
    } = useForm<EditorialRequestDTO>({
        resolver: zodResolver(CreateEditorialSchema),
        defaultValues: {
            language: "JAVA",
            sourceCode: "",
            ...defaultValues,
        },
    });

    const language = useWatch({control, name: "language"});
    const sourceCode = useWatch({control, name: "sourceCode"});

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FieldGroup className="gap-5">
                <Field>
                    <FieldLabel htmlFor="language">Language</FieldLabel>
                    <FieldContent>
                        <Select
                            value={language}
                            onValueChange={(v) =>
                                setValue("language", v as ProgrammingLanguage, {
                                    shouldValidate: true,
                                })
                            }
                            disabled={isPending}
                        >
                            <SelectTrigger aria-label="Select language">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                {LANGUAGE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldContent>
                </Field>

                <Field>
                    <FieldLabel>Source Code</FieldLabel>
                    <FieldContent className="gap-1">
                        <Textarea
                            className="hidden"
                            {...register("sourceCode")}
                        />
                        <div className="rounded-xl border border-input overflow-hidden">
                            <MonacoEditor
                                height="400px"
                                language={LANGUAGE_MAP[language]}
                                value={sourceCode}
                                onChange={(val) =>
                                    setValue("sourceCode", val ?? "", {shouldValidate: true})
                                }
                                theme="vs-dark"
                                options={{
                                    minimap: {enabled: false},
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 4,
                                }}
                            />
                        </div>
                        {errors.sourceCode && (
                            <FieldError>{errors.sourceCode.message}</FieldError>
                        )}
                    </FieldContent>
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
