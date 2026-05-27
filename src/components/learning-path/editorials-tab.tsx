"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Check, Code2, Copy, FileCode, Maximize2, Minimize2, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Editorial, ProgrammingLanguage } from "@/types/learning-path";
import { EditorialRequestDTO } from "@/types/learning-path/schema";
import {
    useCreateEditorial,
    useDeleteEditorial,
    useEditorialsByLesson,
    useUpdateEditorial
} from "@/hooks/use-editorials";

const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="h-64 rounded-lg border border-input bg-muted animate-pulse" />
        ),
    }
);

interface EditorialsTabProps {
    lessonId: number;
}

const LANGUAGE_OPTIONS: { value: ProgrammingLanguage; label: string; icon: string; monacoLang: string }[] = [
    { value: "JAVA", label: "Java", icon: "☕", monacoLang: "java" },
    { value: "PYTHON", label: "Python", icon: "🐍", monacoLang: "python" },
];

const LANGUAGE_COLORS: Record<ProgrammingLanguage, { bg: string; text: string; border: string }> = {
    JAVA: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-l-orange-500" },
    PYTHON: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-l-blue-500" },
};

export function EditorialsTab({ lessonId }: EditorialsTabProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<Editorial | null>(null);

    const { data: editorials = [], isLoading } = useEditorialsByLesson(lessonId);
    const createMutation = useCreateEditorial(lessonId);
    const updateMutation = useUpdateEditorial(editing?.id ?? 0);
    const deleteMutation = useDeleteEditorial();

    const handleSubmit = async (formData: EditorialRequestDTO) => {
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
                        Solution code to help students learn different approaches
                    </p>
                </div>
                <Button onClick={() => {
                    setEditing(null);
                    setIsFormOpen(true);
                }}>
                    <Plus className="size-4 mr-2" />
                    Add Editorial
                </Button>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && editorials.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <FileCode className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No editorials yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                            Add solution code in multiple programming languages to help students understand different approaches.
                        </p>
                        <Button onClick={() => {
                            setEditing(null);
                            setIsFormOpen(true);
                        }}>
                            <Plus className="size-4 mr-2" />
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

            {/* Form Dialog — Full-screen Monaco editor */}
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
// Editorial Card — with Monaco read-only viewer
// ---------------------------------------------------------------------------
interface EditorialCardProps {
    editorial: Editorial;
    onEdit: () => void;
    onDelete: () => void;
}

function EditorialCard({ editorial: ed, onEdit, onDelete }: EditorialCardProps) {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const langConfig = LANGUAGE_OPTIONS.find((l) => l.value === ed.language);
    const colors = LANGUAGE_COLORS[ed.language];
    const lineCount = ed.sourceCode.split("\n").length;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(ed.sourceCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className={cn("border-l-4 overflow-hidden", colors.border)}>
            <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className={cn("flex items-center justify-center size-8 rounded-lg", colors.bg)}>
                            <Code2 className={cn("size-4", colors.text)} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm">
                                    {langConfig?.label ?? ed.language} Solution
                                </h3>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {lineCount} lines
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Collapse" : "Expand"}>
                            {isExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={handleCopy} title="Copy code">
                            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={onEdit} title="Edit">
                            <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={onDelete} className="text-destructive hover:text-destructive" title="Delete">
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Code viewer with Monaco (read-only) */}
                <MonacoEditor
                    height={isExpanded ? "400px" : "200px"}
                    language={langConfig?.monacoLang ?? "plaintext"}
                    value={ed.sourceCode}
                    theme="vs-dark"
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 12,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        padding: { top: 8, bottom: 8 },
                        wordWrap: "on",
                        renderLineHighlight: "none",
                        scrollbar: { vertical: "auto", horizontal: "auto" },
                        domReadOnly: true,
                    }}
                />
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Editorial Form Dialog — Full Monaco editor experience
// ---------------------------------------------------------------------------
interface EditorialDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editorial: Editorial | null;
    onSubmit: (data: EditorialRequestDTO) => Promise<void>;
    isPending: boolean;
}

function EditorialDialog({ open, onOpenChange, editorial, onSubmit, isPending }: EditorialDialogProps) {
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
        await onSubmit({ language, sourceCode });
    };

    const langConfig = LANGUAGE_OPTIONS.find((l) => l.value === language);
    const isValid = sourceCode.trim().length > 0;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle>
                        {editorial ? "Edit Editorial" : "Add Editorial"}
                    </DialogTitle>
                    <DialogDescription>
                        Write the solution code with full syntax highlighting and autocomplete.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    {/* Language selector */}
                    <div className="px-6 pb-4">
                        <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium shrink-0">Language:</Label>
                            <div className="flex items-center gap-1">
                                {LANGUAGE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setLanguage(opt.value)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                            language === opt.value
                                                ? `${LANGUAGE_COLORS[opt.value].bg} ${LANGUAGE_COLORS[opt.value].text} ring-1 ring-current/20`
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        <span>{opt.icon}</span>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Monaco Editor — takes remaining space */}
                    <div className="flex-1 min-h-0 border-y">
                        <MonacoEditor
                            height="100%"
                            language={langConfig?.monacoLang ?? "plaintext"}
                            value={sourceCode}
                            onChange={(val) => setSourceCode(val ?? "")}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: true, maxColumn: 80 },
                                fontSize: 13,
                                lineNumbers: "on",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 4,
                                padding: { top: 12, bottom: 12 },
                                wordWrap: "off",
                                renderLineHighlight: "all",
                                bracketPairColorization: { enabled: true },
                                guides: { bracketPairs: true },
                                suggest: { showKeywords: true, showSnippets: true },
                                quickSuggestions: true,
                            }}
                        />
                    </div>

                    {/* Footer */}
                    <DialogFooter className="px-6 py-4">
                        <div className="flex items-center gap-2 mr-auto text-xs text-muted-foreground">
                            <span>{sourceCode.split("\n").length} lines</span>
                            <span className="text-muted-foreground/40">|</span>
                            <span>{sourceCode.length} chars</span>
                        </div>
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
