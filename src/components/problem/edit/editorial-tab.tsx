"use client";

import {useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useQueryClient} from "@tanstack/react-query";
import dynamic from "next/dynamic";
import {toast} from "sonner";
import z from "zod";


import {toAppError} from "@/api/core/api-error";
import {useUpsertModelSolution} from "@/hooks/use-problem";
import {ProblemDetailAdmin} from "@/types/problem";
import {ProgrammingLanguageEnum} from "@/schemas/problem-wizard.schema";

import {Button} from "@/components/ui/button";
import {Field, FieldError, FieldLabel} from "@/components/ui/field";

import {AlertCircleIcon, Loader2Icon, SaveIcon,} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[400px] rounded-xl border border-input bg-input/10">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground"/>
        </div>
    ),
});

const LANGUAGES = [
    {key: "cpp" as const, label: "C++", monacoLang: "cpp"},
    {key: "python" as const, label: "Python", monacoLang: "python"},
    {key: "java" as const, label: "Java", monacoLang: "java"},
];

const editorialSchema = z.object({
    language: ProgrammingLanguageEnum,
    code: z.string().min(1, "Editorial code is required."),
});

type EditorialData = z.infer<typeof editorialSchema>;

export function EditorialTab({problem}: { problem: ProblemDetailAdmin }) {
    const [serverError, setServerError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const {
        handleSubmit,
        control,
        formState: {errors, isDirty},
    } = useForm<EditorialData>({
        resolver: zodResolver(editorialSchema),
        defaultValues: {
            language: problem.modelSolutionLanguage || "CPP",
            code: problem.modelSolutionCode || "",
        },
    });

    const updateEditorialHook = useUpsertModelSolution(problem.id);

    const updateEditorial = {
        isPending: updateEditorialHook.isPending,
        mutate: (data: EditorialData) => {
            updateEditorialHook.mutate(data, {
                onSuccess: () => {
                    toast.success("Editorial updated successfully.");
                    setServerError(null);
                },
                onError: (err) => {
                    const appError = toAppError(err);
                    let errorMessage = appError.message;

                    const axiosError = err as any;
                    const responseData = axiosError?.response?.data;
                    if (responseData?.error_code === "TESTCASE_VALIDATION_FAILED" && responseData?.details) {
                        const details = responseData.details;
                        errorMessage = `Editorial validation failed: ` + details.map((d: any) => `Case #${d.testcaseIndex + 1}: ${d.status}`).join(', ');
                    }

                    setServerError(errorMessage);
                }
            });
        }
    };

    const onSubmit = (data: EditorialData) => {
        updateEditorial.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div>
                    <h2 className="text-lg font-semibold">Editorial Code</h2>
                    <p className="text-sm text-muted-foreground">Provide an official model solution. This is tested
                        before saving.</p>
                </div>
                <Button type="submit" disabled={!isDirty || updateEditorial.isPending}>
                    {updateEditorial.isPending ? (
                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin"/>
                    ) : (
                        <SaveIcon className="w-4 h-4 mr-2"/>
                    )}
                    Save Editorial
                </Button>
            </div>

            {serverError && (
                <div
                    className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    role="alert">
                    <AlertCircleIcon className="size-4 shrink-0"/>
                    <p>{serverError}</p>
                </div>
            )}

            <div className="space-y-4">
                <Field className="max-w-[200px]">
                    <FieldLabel>Language</FieldLabel>
                    <Controller
                        control={control}
                        name="language"
                        render={({field}) => (
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                disabled={updateEditorial.isPending}
                            >
                                <option value="CPP">C++</option>
                                <option value="JAVA">Java</option>
                                <option value="PYTHON">Python</option>
                            </select>
                        )}
                    />
                </Field>

                <Controller
                    control={control}
                    name="code"
                    render={({field}) => {
                        const selectedLanguage = control._formValues.language;
                        const monacoLang = LANGUAGES.find(l => l.key.toUpperCase() === selectedLanguage)?.monacoLang || "cpp";
                        return (
                            <div className="rounded-xl border border-input overflow-hidden relative">
                                <MonacoEditor
                                    height="500px"
                                    language={monacoLang}
                                    theme="vs-dark"
                                    value={field.value}
                                    onChange={(val) => field.onChange(val ?? "")}
                                    options={{
                                        minimap: {enabled: false},
                                        fontSize: 14,
                                        lineNumbers: "on",
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 4,
                                        wordWrap: "on",
                                        padding: {top: 12},
                                    }}
                                />
                            </div>
                        );
                    }}
                />

                {errors.code && (
                    <FieldError className="mt-2">{errors.code.message}</FieldError>
                )}
            </div>
        </form>
    );
}
