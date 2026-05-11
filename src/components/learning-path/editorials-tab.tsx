"use client";

import {useState} from "react";
import {Check, Code2, Copy, FileCode, Pencil, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Editorial, ProgrammingLanguage} from "@/types/learning-path";
import {CreateEditorialDTO} from "@/types/learning-path/schema";
import {
    useCreateEditorial,
    useDeleteEditorial,
    useEditorialsByLesson,
    useUpdateEditorial
} from "@/hooks/use-editorials";

interface EditorialsTabProps {
    lessonId: number;
}

const LANGUAGE_OPTIONS: { value: ProgrammingLanguage; label: string; icon: string }[] = [
    {value: "JAVA", label: "Java", icon: "☕"},
    {value: "PYTHON", label: "Python", icon: "🐍"},
];

const LANGUAGE_COLORS: Record<ProgrammingLanguage, { bg: string; text: string }> = {
    JAVA: {bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400"},
    PYTHON: {bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400"},
};

export function EditorialsTab({lessonId}: EditorialsTabProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<Editorial | null>(null);

    const {data: editorials = [], isLoading} = useEditorialsByLesson(lessonId);
    const createMutation = useCreateEditorial(lessonId);
    const updateMutation = useUpdateEditorial(editing?.id ?? 0);
    const deleteMutation = useDeleteEditorial();

    const handleSubmit = async (formData: CreateEditorialDTO) => {
        if (editing) {
            await updateMutation.mutateAsync(formData);
        } else {
            await createMutation.mutateAsync(formData);
        }
        setIsFormOpen(false);
        setEditing(null);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this editorial?")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">Editorials</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Add solution code to help students learn
                    </p>
                </div>
                <Button onClick={() => {
                    setEditing(null);
                    setIsFormOpen(true);
                }}>
                    <Plus className="size-4 mr-2"/>
                    Add Editorial
                </Button>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-muted animate-pulse"/>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && editorials.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <FileCode className="size-8 text-muted-foreground"/>
                        </div>
                        <h3 className="text-lg font-medium mb-2">No editorials yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                            Add solution code in multiple programming languages to help students understand different
                            approaches.
                        </p>
                        <Button onClick={() => {
                            setEditing(null);
                            setIsFormOpen(true);
                        }}>
                            <Plus className="size-4 mr-2"/>
                            Add First Editorial
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Editorials list */}
            {!isLoading && editorials.length > 0 && (
                <div className="space-y-4">
                    {editorials.map((ed: Editorial) => (
                        <EditorialCard
                            key={ed.id}
                            editorial={ed}
                            onEdit={() => {
                                setEditing(ed);
                                setIsFormOpen(true);
                            }}
                            onDelete={() => handleDelete(ed.id)}
                        />
                    ))}
                </div>
            )}

            {/* Form Dialog */}
            <EditorialDialog
                open={isFormOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsFormOpen(false);
                        setEditing(null);
                    }
                }}
                editorial={editing}
                onSubmit={handleSubmit}
                isPending={editing ? updateMutation.isPending : createMutation.isPending}
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Editorial Card Component
// ---------------------------------------------------------------------------
interface EditorialCardProps {
    editorial: Editorial;
    onEdit: () => void;
    onDelete: () => void;
}

function EditorialCard({editorial: ed, onEdit, onDelete}: EditorialCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(ed.sourceCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex items-center justify-center size-10 rounded-lg ${LANGUAGE_COLORS[ed.language].bg}`}>
                            <Code2 className={`size-5 ${LANGUAGE_COLORS[ed.language].text}`}/>
                        </div>
                        <div>
                            <h3 className="font-semibold">{ed.language === "JAVA" ? "Java" : "Python"} Solution</h3>
                            <p className="text-xs text-muted-foreground">
                                {ed.sourceCode.split("\n").length} lines
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
                            {copied ? <Check className="size-4 text-emerald-500"/> : <Copy className="size-4"/>}
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={onEdit}>
                            <Pencil className="size-4"/>
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={onDelete}
                                className="text-destructive hover:text-destructive">
                            <Trash2 className="size-4"/>
                        </Button>
                    </div>
                </div>

                {/* Code block */}
                <div className="relative">
                    <pre className="text-sm bg-muted/50 rounded-lg p-4 overflow-x-auto max-h-80 overflow-y-auto">
                        <code className={`font-mono ${
                            ed.language === "JAVA" ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"
                        }`}>
                            {ed.sourceCode}
                        </code>
                    </pre>
                </div>
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Editorial Form Dialog
// ---------------------------------------------------------------------------
interface EditorialDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editorial: Editorial | null;
    onSubmit: (data: CreateEditorialDTO) => Promise<void>;
    isPending: boolean;
}

function EditorialDialog({open, onOpenChange, editorial, onSubmit, isPending}: EditorialDialogProps) {
    const [language, setLanguage] = useState<ProgrammingLanguage>(editorial?.language ?? "JAVA");
    const [sourceCode, setSourceCode] = useState(editorial?.sourceCode ?? "");

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setLanguage(editorial?.language ?? "JAVA");
            setSourceCode(editorial?.sourceCode ?? "");
        }
        onOpenChange(open);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            language,
            sourceCode,
        });
    };

    const isValid = sourceCode.trim().length > 0;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editorial ? "Edit Editorial" : "Add Editorial"}
                    </DialogTitle>
                    <DialogDescription>
                        Add solution code to help students understand the problem.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Programming Language</Label>
                        <Select value={language} onValueChange={(v) => setLanguage(v as ProgrammingLanguage)}>
                            <SelectTrigger>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                {LANGUAGE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{opt.icon}</span>
                                            {opt.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sourceCode" className="text-sm font-medium">
                            Source Code <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="sourceCode"
                            value={sourceCode}
                            onChange={(e) => setSourceCode(e.target.value)}
                            placeholder={
                                language === "JAVA"
                                    ? "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n    }\n}"
                                    : "class Solution:\n    def two_sum(self, nums: List[int], target: int) -> List[int]:\n        # Your solution here\n        pass"
                            }
                            className="font-mono text-sm min-h-[300px]"
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || !isValid}>
                            {isPending ? "Saving..." : editorial ? "Save Changes" : "Add Editorial"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
