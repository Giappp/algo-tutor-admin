"use client";

import { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, Code2, Pencil, Plus, Trash2, FileText, ExternalLink, Upload, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TestCase, CreateTestCaseRequest } from "@/types/learning-path";
import { useCreateTestCase, useDeleteTestCase, useReorderTestCases, useTestCasesByLesson, useUpdateTestCase } from "@/hooks/use-testcases";
import { testCaseService } from "@/api/services/testcase-services";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTestCaseSchema } from "@/types/learning-path/schema";

interface TestCasesTabProps {
    lessonId: number;
}

export function TestCasesTab({ lessonId }: TestCasesTabProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<TestCase | null>(null);

    const { data: testCases = [], isLoading } = useTestCasesByLesson(lessonId);
    const createMutation = useCreateTestCase(lessonId);
    const updateMutation = useUpdateTestCase(editing?.id ?? 0);
    const deleteMutation = useDeleteTestCase();
    const reorderMutation = useReorderTestCases(lessonId);

    const handleSubmit = async (formData: CreateTestCaseRequest) => {
        try {
            if (editing) {
                await updateMutation.mutateAsync(formData);
            } else {
                await createMutation.mutateAsync(formData);
            }
            setIsFormOpen(false);
            setEditing(null);
        } catch (err) {
            console.error("Failed to save testcase:", err);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this test case?")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleReorder = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= testCases.length) return;
        const fromTc = testCases[fromIndex];
        const toTc = testCases[toIndex];
        reorderMutation.mutate({
            fromId: fromTc.id,
            fromOrder: fromTc.sortOrder, // Use sortOrder instead of orderIndex
            toId: toTc.id,
            toOrder: toTc.sortOrder, // Use sortOrder instead of orderIndex
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">Test Cases</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Define inputs and expected outputs to validate solutions via S3 S3 .in/.out files
                    </p>
                </div>
                <Button onClick={() => {
                    setEditing(null);
                    setIsFormOpen(true);
                }}>
                    <Plus className="size-4 mr-2" />
                    Add Test Case
                </Button>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && testCases.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <Code2 className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No test cases yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                            Create test cases to validate student solutions. Upload an input and expected output file to start.
                        </p>
                        <Button onClick={() => {
                            setEditing(null);
                            setIsFormOpen(true);
                        }}>
                            <Plus className="size-4 mr-2" />
                            Add First Test Case
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Test cases list */}
            {!isLoading && testCases.length > 0 && (
                <div className="space-y-3">
                    {testCases.map((tc: TestCase, index: number) => (
                        <TestCaseCard
                            key={tc.id}
                            testCase={tc}
                            index={index}
                            total={testCases.length}
                            onEdit={() => {
                                setEditing(tc);
                                setIsFormOpen(true);
                            }}
                            onDelete={() => handleDelete(tc.id)}
                            onMoveUp={() => handleReorder(index, index - 1)}
                            onMoveDown={() => handleReorder(index, index + 1)}
                        />
                    ))}
                </div>
            )}

            {/* Summary stats */}
            {!isLoading && testCases.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{testCases.length} test case{testCases.length !== 1 ? "s" : ""}</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{testCases.filter((tc) => tc.isSample).length} sample cases</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{testCases.filter((tc) => !tc.isSample).length} standard cases</span>
                </div>
            )}

            {/* Form Dialog */}
            <TestCaseDialog
                open={isFormOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsFormOpen(false);
                        setEditing(null);
                    }
                }}
                testCase={editing}
                onSubmit={handleSubmit}
                isPending={editing ? updateMutation.isPending : createMutation.isPending}
                lessonId={lessonId}
                nextSortOrder={testCases.length > 0 ? Math.max(...testCases.map(tc => tc.sortOrder)) + 1 : 1}
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Test Case Card Component
// ---------------------------------------------------------------------------
interface TestCaseCardProps {
    testCase: TestCase;
    index: number;
    total: number;
    onEdit: () => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

function TestCaseCard({ testCase: tc, index, total, onEdit, onDelete, onMoveUp, onMoveDown }: TestCaseCardProps) {
    const getInputFileName = (url: string) => {
        try {
            const parts = url.split("/");
            return parts[parts.length - 1];
        } catch {
            return "input.in";
        }
    };

    const getOutputFileName = (url: string) => {
        try {
            const parts = url.split("/");
            return parts[parts.length - 1];
        } catch {
            return "output.out";
        }
    };

    return (
        <Card className={`border-l-4 ${tc.isSample ? "border-l-emerald-500 bg-emerald-500/5" : "border-l-indigo-500 bg-card"}`}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    {/* Left: Index & Status */}
                    <div className="flex items-center gap-3">
                        {/* Reorder buttons */}
                        <div className="flex flex-col gap-0.5">
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={onMoveUp}
                                disabled={index === 0}
                                className="size-5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                title="Move up"
                            >
                                <ArrowUp className="size-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={onMoveDown}
                                disabled={index === total - 1}
                                className="size-5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                title="Move down"
                            >
                                <ArrowDown className="size-3" />
                            </Button>
                        </div>
                        <div
                            className={`flex items-center justify-center size-8 rounded-lg font-mono text-sm font-semibold ${tc.isSample ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                }`}>
                            {index + 1}
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                {tc.isSample ? (
                                    <Badge variant="outline"
                                        className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                        Sample Case
                                    </Badge>
                                ) : (
                                    <Badge variant="outline"
                                        className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
                                        Standard Case
                                    </Badge>
                                )}
                                <Badge variant="secondary" className="text-[10px] tabular-nums font-medium">
                                    Weight: {tc.scoreWeight}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] tabular-nums">
                                    Sort Order: {tc.sortOrder}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={onEdit}>
                            <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={onDelete}
                            className="text-destructive hover:text-destructive">
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>

                {/* Input & Output S3 URLs */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Input File (.in)
                        </Label>
                        <a
                            href={tc.inputFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-muted-foreground/10 hover:bg-muted/65 transition-colors group"
                        >
                            <FileText className="size-4.5 text-emerald-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate font-mono text-foreground">
                                    {getInputFileName(tc.inputFileUrl)}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    Click to view standard input
                                </p>
                            </div>
                            <ExternalLink className="size-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </a>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Output File (.out)
                        </Label>
                        <a
                            href={tc.outputFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-muted-foreground/10 hover:bg-muted/65 transition-colors group"
                        >
                            <FileText className="size-4.5 text-rose-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate font-mono text-foreground">
                                    {getOutputFileName(tc.outputFileUrl)}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    Click to view expected output
                                </p>
                            </div>
                            <ExternalLink className="size-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </a>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Test Case Form Dialog
// ---------------------------------------------------------------------------
interface TestCaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    testCase: TestCase | null;
    onSubmit: (data: CreateTestCaseRequest) => Promise<void>;
    isPending: boolean;
    lessonId: number;
    nextSortOrder: number;
}

function TestCaseDialog({ open, onOpenChange, testCase, onSubmit, isPending, lessonId, nextSortOrder }: TestCaseDialogProps) {
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [outputFile, setOutputFile] = useState<File | null>(null);

    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStep, setUploadStep] = useState("");
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateTestCaseRequest>({
        resolver: zodResolver(CreateTestCaseSchema),
        defaultValues: {
            inputFileUrl: "",
            inputFileKey: "",
            outputFileUrl: "",
            outputFileKey: "",
            scoreWeight: 10,
            isSample: false,
            sortOrder: nextSortOrder,
        }
    });

    // React Hook Form's watch function is intentionally reactive and not compiler-memoizable.
    // eslint-disable-next-line react-hooks/incompatible-library
    const inputFileUrl = watch("inputFileUrl");
    const outputFileUrl = watch("outputFileUrl");
    const isSample = watch("isSample");

    useEffect(() => {
        if (open) {
            reset({
                inputFileUrl: testCase?.inputFileUrl ?? "",
                inputFileKey: testCase?.inputFileKey ?? "",
                outputFileUrl: testCase?.outputFileUrl ?? "",
                outputFileKey: testCase?.outputFileKey ?? "",
                scoreWeight: testCase?.scoreWeight ?? 10,
                isSample: testCase?.isSample ?? false,
                sortOrder: testCase?.sortOrder ?? nextSortOrder,
            });
            setInputFile(null);
            setOutputFile(null);
            setUploadStatus("idle");
            setUploadProgress(0);
            setUploadStep("");
            setUploadError(null);
        }
    }, [open, testCase, nextSortOrder, reset]);

    useEffect(() => {
        register("inputFileUrl");
        register("inputFileKey");
        register("outputFileUrl");
        register("outputFileKey");
    }, [register]);

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
    };

    const getFileNameFromUrl = (url: string) => {
        if (!url) return "";
        try {
            const parts = url.split("/");
            return parts[parts.length - 1];
        } catch {
            return "file";
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const handleUploadFiles = async () => {
        if (!inputFile || !outputFile) {
            setUploadError("Please select both .in and .out files first.");
            return;
        }

        setUploadStatus("uploading");
        setUploadProgress(10);
        setUploadStep("Requesting secure S3 upload credentials...");
        setUploadError(null);

        try {
            const requestPayload = {
                files: [
                    { fileName: inputFile.name, fileType: "INPUT" as const },
                    { fileName: outputFile.name, fileType: "OUTPUT" as const }
                ]
            };

            const presignedResponses = await testCaseService.getPresignedUrls(lessonId, requestPayload);

            const inputPresigned = presignedResponses.find(f => f.fileType === "INPUT");
            const outputPresigned = presignedResponses.find(f => f.fileType === "OUTPUT");

            if (!inputPresigned || !outputPresigned) {
                throw new Error("Failed to receive valid presigned upload URLs from server.");
            }

            setUploadProgress(30);
            setUploadStep(`Uploading input file (${inputFile.name})...`);

            await axios.put(inputPresigned.uploadUrl, inputFile, {
                headers: {
                    "Content-Type": "application/octet-stream",
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 35);
                        setUploadProgress(30 + percent);
                    }
                }
            });

            setUploadProgress(65);
            setUploadStep(`Uploading output file (${outputFile.name})...`);

            await axios.put(outputPresigned.uploadUrl, outputFile, {
                headers: {
                    "Content-Type": "application/octet-stream",
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 30);
                        setUploadProgress(65 + percent);
                    }
                }
            });

            setUploadProgress(100);
            setUploadStep("Uploads completed successfully!");

            setValue("inputFileUrl", inputPresigned.downloadUrl, { shouldValidate: true, shouldDirty: true });
            setValue("inputFileKey", inputPresigned.fileKey, { shouldValidate: true, shouldDirty: true });
            setValue("outputFileUrl", outputPresigned.downloadUrl, { shouldValidate: true, shouldDirty: true });
            setValue("outputFileKey", outputPresigned.fileKey, { shouldValidate: true, shouldDirty: true });
            setUploadStatus("success");
            toast.success("Files uploaded successfully to S3!");
        } catch (err) {
            console.error("Upload failed:", err);
            let errorMessage = "File upload failed.";
            if (axios.isAxiosError(err)) {
                errorMessage = err.response?.data?.message || err.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setUploadError(errorMessage);
            setUploadStatus("error");
            toast.error(`Upload error: ${errorMessage}`);
        }
    };

    const handleFormSubmit = handleSubmit(
        async (data) => {
            if (!data.inputFileUrl || !data.outputFileUrl) {
                toast.error("Both input and output files must be successfully uploaded first.");
                return;
            }
            await onSubmit(data);
        },
        (validationErrors) => {
            console.error("Test Case Form Validation Errors:", validationErrors);
            toast.error("Form validation failed. Please check all fields.");
        }
    );

    const hasUrls = !!inputFileUrl && !!outputFileUrl;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {testCase ? "Edit Test Case" : "Add Test Case"}
                    </DialogTitle>
                    <DialogDescription>
                        Upload the `.in` input file and `.out` expected output file for this testcase.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                    {/* Input file upload */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">
                            Input File (.in) <span className="text-destructive">*</span>
                        </Label>
                        {inputFileUrl ? (
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="size-4 shrink-0 text-emerald-500" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold font-mono truncate">{inputFile ? inputFile.name : getFileNameFromUrl(inputFileUrl)}</span>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Uploaded & Securely Stored</span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => {
                                        setValue("inputFileUrl", "", { shouldValidate: true, shouldDirty: true });
                                        setValue("inputFileKey", "", { shouldValidate: true, shouldDirty: true });
                                        setInputFile(null);
                                        setUploadStatus("idle");
                                    }}
                                    className="text-emerald-500/70 hover:text-emerald-700 hover:bg-emerald-500/10 size-6"
                                >
                                    <X className="size-3.5" />
                                </Button>
                            </div>
                        ) : inputFile ? (
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="size-4 shrink-0 text-amber-500" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold font-mono truncate">{inputFile.name}</span>
                                        <span className="text-[10px] text-amber-600 dark:text-amber-400">{formatFileSize(inputFile.size)} • Ready to upload</span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => {
                                        setInputFile(null);
                                    }}
                                    className="text-amber-500/70 hover:text-amber-700 hover:bg-amber-500/10 size-6"
                                >
                                    <X className="size-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="relative flex items-center justify-center p-4 border-2 border-dashed rounded-lg bg-muted/20 border-muted-foreground/20 hover:border-indigo-500/50 hover:bg-muted/40 transition-all cursor-pointer">
                                <input
                                    type="file"
                                    accept=".in"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (!file.name.endsWith(".in")) {
                                                toast.error("Input file must have a .in extension.");
                                                return;
                                            }
                                            setInputFile(file);
                                            setUploadError(null);
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <div className="flex flex-col items-center gap-1.5 text-center pointer-events-none">
                                    <Upload className="size-5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        Select or drag input file (.in)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Output file upload */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">
                            Expected Output File (.out) <span className="text-destructive">*</span>
                        </Label>
                        {outputFileUrl ? (
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="size-4 shrink-0 text-emerald-500" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold font-mono truncate">{outputFile ? outputFile.name : getFileNameFromUrl(outputFileUrl)}</span>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Uploaded & Securely Stored</span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => {
                                        setValue("outputFileUrl", "", { shouldValidate: true, shouldDirty: true });
                                        setValue("outputFileKey", "", { shouldValidate: true, shouldDirty: true });
                                        setOutputFile(null);
                                        setUploadStatus("idle");
                                    }}
                                    className="text-emerald-500/70 hover:text-emerald-700 hover:bg-emerald-500/10 size-6"
                                >
                                    <X className="size-3.5" />
                                </Button>
                            </div>
                        ) : outputFile ? (
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="size-4 shrink-0 text-amber-500" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold font-mono truncate">{outputFile.name}</span>
                                        <span className="text-[10px] text-amber-600 dark:text-amber-400">{formatFileSize(outputFile.size)} • Ready to upload</span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => {
                                        setOutputFile(null);
                                    }}
                                    className="text-amber-500/70 hover:text-amber-700 hover:bg-amber-500/10 size-6"
                                >
                                    <X className="size-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="relative flex items-center justify-center p-4 border-2 border-dashed rounded-lg bg-muted/20 border-muted-foreground/20 hover:border-indigo-500/50 hover:bg-muted/40 transition-all cursor-pointer">
                                <input
                                    type="file"
                                    accept=".out"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (!file.name.endsWith(".out")) {
                                                toast.error("Output file must have a .out extension.");
                                                return;
                                            }
                                            setOutputFile(file);
                                            setUploadError(null);
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <div className="flex flex-col items-center gap-1.5 text-center pointer-events-none">
                                    <Upload className="size-5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        Select or drag output file (.out)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress tracking */}
                    {uploadStatus === "uploading" && (
                        <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                    <Loader2 className="size-3.5 animate-spin" />
                                    {uploadStep}
                                </span>
                                <span className="text-muted-foreground tabular-nums">{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Upload error display */}
                    {uploadError && (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-destructive/5 border-destructive/20 text-destructive text-xs">
                            <AlertCircle className="size-4 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold">Upload failed</p>
                                <p className="text-muted-foreground mt-0.5">{uploadError}</p>
                            </div>
                        </div>
                    )}

                    {/* Trigger upload button */}
                    {!hasUrls && uploadStatus !== "uploading" && (
                        <Button
                            type="button"
                            onClick={handleUploadFiles}
                            disabled={!inputFile || !outputFile}
                            className="w-full gap-2 shadow-sm h-10 font-semibold"
                        >
                            <Upload className="size-4" />
                            Upload Files to S3
                        </Button>
                    )}

                    {/* Rest of the configurations - displayed only when uploads are complete */}
                    {hasUrls && (
                        <div className="space-y-4 pt-2 border-t border-dashed animate-in fade-in slide-in-from-top-2 duration-300">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Configuration Settings
                            </h4>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="scoreWeight" className="text-xs font-semibold text-muted-foreground uppercase">
                                        Score Weight <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="scoreWeight"
                                        type="number"
                                        min={0}
                                        {...register("scoreWeight", { valueAsNumber: true })}
                                        className="font-medium"
                                    />
                                    {errors.scoreWeight && (
                                        <p className="text-xs text-destructive mt-0.5">{errors.scoreWeight.message}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">
                                        Weight of this testcase in total lesson score.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sortOrder" className="text-xs font-semibold text-muted-foreground uppercase">
                                        Sort Order <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="sortOrder"
                                        type="number"
                                        min={1}
                                        {...register("sortOrder", { valueAsNumber: true })}
                                        className="font-medium"
                                    />
                                    {errors.sortOrder && (
                                        <p className="text-xs text-destructive mt-0.5">{errors.sortOrder.message}</p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground">
                                        Execution and presentation priority order.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/10">
                                <div className="space-y-0.5 pr-4">
                                    <Label htmlFor="isSample" className="text-sm font-semibold cursor-pointer">
                                        Sample Test Case
                                    </Label>
                                    <p className="text-[11px] text-muted-foreground">
                                        Sample cases are visible to students and show input/output examples.
                                    </p>
                                </div>
                                <Switch
                                    id="isSample"
                                    checked={isSample}
                                    onCheckedChange={(checked) => setValue("isSample", checked)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-2 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || !hasUrls}>
                            {isPending ? "Saving..." : testCase ? "Save Changes" : "Add Test Case"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
