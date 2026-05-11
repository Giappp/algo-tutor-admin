"use client";

import {useState} from "react";
import {Code2, EyeOff, Pencil, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {TestCase} from "@/types/learning-path";
import {CreateTestCaseDTO} from "@/types/learning-path/schema";
import {useCreateTestCase, useDeleteTestCase, useTestCasesByLesson, useUpdateTestCase} from "@/hooks/use-testcases";

interface TestCasesTabProps {
    lessonId: number;
}

export function TestCasesTab({lessonId}: TestCasesTabProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<TestCase | null>(null);

    const {data: testCases = [], isLoading} = useTestCasesByLesson(lessonId);
    const createMutation = useCreateTestCase(lessonId);
    const updateMutation = useUpdateTestCase(editing?.id ?? 0);
    const deleteMutation = useDeleteTestCase();

    const handleSubmit = async (formData: CreateTestCaseDTO) => {
        if (editing) {
            await updateMutation.mutateAsync(formData);
        } else {
            await createMutation.mutateAsync(formData);
        }
        setIsFormOpen(false);
        setEditing(null);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this test case?")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">Test Cases</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Define inputs and expected outputs to validate solutions
                    </p>
                </div>
                <Button onClick={() => {
                    setEditing(null);
                    setIsFormOpen(true);
                }}>
                    <Plus className="size-4 mr-2"/>
                    Add Test Case
                </Button>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse"/>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && testCases.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <Code2 className="size-8 text-muted-foreground"/>
                        </div>
                        <h3 className="text-lg font-medium mb-2">No test cases yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                            Create test cases to validate student solutions. Start with simple cases and add edge cases.
                        </p>
                        <Button onClick={() => {
                            setEditing(null);
                            setIsFormOpen(true);
                        }}>
                            <Plus className="size-4 mr-2"/>
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
                            onEdit={() => {
                                setEditing(tc);
                                setIsFormOpen(true);
                            }}
                            onDelete={() => handleDelete(tc.id)}
                        />
                    ))}
                </div>
            )}

            {/* Summary stats */}
            {!isLoading && testCases.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{testCases.length} test case{testCases.length !== 1 ? "s" : ""}</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{testCases.filter((tc) => tc.isHidden).length} hidden</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{testCases.filter((tc) => !tc.isHidden).length} visible</span>
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
    onEdit: () => void;
    onDelete: () => void;
}

function TestCaseCard({testCase: tc, index, onEdit, onDelete}: TestCaseCardProps) {
    return (
        <Card className={`border-l-4 ${tc.isHidden ? "border-l-amber-500" : "border-l-emerald-500"}`}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    {/* Left: Index & Status */}
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex items-center justify-center size-8 rounded-lg font-mono text-sm font-semibold ${
                                tc.isHidden ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            }`}>
                            {index + 1}
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                {tc.isHidden && (
                                    <Badge variant="outline"
                                           className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                        <EyeOff className="size-3 mr-1"/>
                                        Hidden
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={onEdit}>
                            <Pencil className="size-4"/>
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={onDelete}
                                className="text-destructive hover:text-destructive">
                            <Trash2 className="size-4"/>
                        </Button>
                    </div>
                </div>

                {/* Input & Output */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Input (stdin)
                        </Label>
                        <div className="p-3 rounded-lg bg-muted/50 border font-mono text-sm min-h-[60px]">
                            {tc.stdin || <span className="text-muted-foreground italic">Empty</span>}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Expected Output (stdout)
                        </Label>
                        <div className="p-3 rounded-lg bg-muted/50 border font-mono text-sm min-h-[60px]">
                            {tc.expectedStdout || <span className="text-muted-foreground italic">Empty</span>}
                        </div>
                    </div>
                </div>

                {/* Explanation */}
                {tc.explanation && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-dashed">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Explanation: </span>
                            {tc.explanation}
                        </p>
                    </div>
                )}
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
    onSubmit: (data: CreateTestCaseDTO) => Promise<void>;
    isPending: boolean;
}

function TestCaseDialog({open, onOpenChange, testCase, onSubmit, isPending}: TestCaseDialogProps) {
    const [stdin, setStdin] = useState(testCase?.stdin ?? "");
    const [expectedStdout, setExpectedStdout] = useState(testCase?.expectedStdout ?? "");
    const [explanation, setExplanation] = useState(testCase?.explanation ?? "");
    const [isHidden, setIsHidden] = useState(testCase?.isHidden ?? false);

    // Reset form when dialog opens/closes or testCase changes
    const handleOpenChange = (open: boolean) => {
        if (open) {
            setStdin(testCase?.stdin ?? "");
            setExpectedStdout(testCase?.expectedStdout ?? "");
            setExplanation(testCase?.explanation ?? "");
            setIsHidden(testCase?.isHidden ?? false);
        }
        onOpenChange(open);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            stdin,
            expectedStdout,
            explanation: explanation || undefined,
            isHidden,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {testCase ? "Edit Test Case" : "Add Test Case"}
                    </DialogTitle>
                    <DialogDescription>
                        Define the input and expected output for this test case.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="stdin" className="text-sm font-medium">
                            Input (stdin) <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="stdin"
                            value={stdin}
                            onChange={(e) => setStdin(e.target.value)}
                            placeholder="2 7 11 15&#10;9"
                            className="font-mono text-sm min-h-[100px]"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the input that will be passed to the solution.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expectedStdout" className="text-sm font-medium">
                            Expected Output (stdout) <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="expectedStdout"
                            value={expectedStdout}
                            onChange={(e) => setExpectedStdout(e.target.value)}
                            placeholder="[0, 1]"
                            className="font-mono text-sm min-h-[80px]"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            The expected output from the solution.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="explanation" className="text-sm font-medium">
                            Explanation
                        </Label>
                        <Textarea
                            id="explanation"
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Why is this the expected output?"
                            className="text-sm min-h-[80px]"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="isHidden" className="text-sm font-medium cursor-pointer">
                                Hidden Test Case
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Hidden test cases are not shown to students
                            </p>
                        </div>
                        <Switch
                            id="isHidden"
                            checked={isHidden}
                            onCheckedChange={setIsHidden}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || !stdin || !expectedStdout}>
                            {isPending ? "Saving..." : testCase ? "Save Changes" : "Add Test Case"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
