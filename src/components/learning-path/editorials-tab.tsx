"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Check, Code2, Copy, FileCode, Maximize2, Minimize2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import {EditorialForm} from "@/components/learning-path/editorial-form";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
    ssr: false,
    loading: () => <Skeleton className="h-44 rounded-none"/>,
});

interface EditorialsTabProps {
    lessonId: number;
}

const LANGUAGE_OPTIONS: { value: ProgrammingLanguage; label: string; monacoLang: string }[] = [
    { value: "JAVA", label: "Java", monacoLang: "java" },
    { value: "PYTHON", label: "Python", monacoLang: "python" },
    { value: "CPP", label: "C++", monacoLang: "cpp" },
];

export function EditorialsTab({ lessonId }: EditorialsTabProps) {
    const t = useTranslations("codingResources.editorials");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<Editorial | null>(null);

    const editorialsQuery = useEditorialsByLesson(lessonId);
    const { data: editorials = [], isLoading } = editorialsQuery;
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
        if (confirm(t("deleteConfirm"))) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <header className="flex flex-col gap-4 border-b border-border/55 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold tracking-tight">{t("title")}</h2>
                        <Badge variant="secondary" className="rounded-md font-mono text-[10px] tabular-nums">{editorials.length}</Badge>
                    </div>
                    <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
                        {t("description")}
                    </p>
                </div>
                <Button size="sm" onClick={() => {
                    setEditing(null);
                    setIsFormOpen(true);
                }}>
                    <Plus data-icon="inline-start" />
                    {t("add")}
                </Button>
            </header>

            {isLoading && (
                <div className="flex flex-col gap-3" aria-busy="true">
                    {[1, 2].map((i) => (
                        <div key={i} className="overflow-hidden rounded-xl border border-border/60 bg-card">
                            <div className="flex items-center gap-3 border-b border-border/50 p-3"><Skeleton className="size-8 rounded-lg" /><Skeleton className="h-4 w-28" /></div>
                            <Skeleton className="h-44 w-full rounded-none" />
                        </div>
                    ))}
                </div>
            )}

            {editorialsQuery.isError && (
                <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/[0.025] p-8 text-center">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><AlertCircle /></div>
                    <div><h3 className="text-sm font-semibold">{t("loadError")}</h3><p className="mt-1 text-xs text-muted-foreground">{t("loadErrorDescription")}</p></div>
                    <Button variant="outline" size="sm" onClick={() => editorialsQuery.refetch()}><RefreshCw data-icon="inline-start" />{t("retry")}</Button>
                </div>
            )}

            {!isLoading && !editorialsQuery.isError && editorials.length === 0 && (
                <Card className="border-dashed bg-muted/10 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
                        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/12">
                            <FileCode />
                        </div>
                        <h3 className="text-sm font-semibold">{t("emptyTitle")}</h3>
                        <p className="mb-5 mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                            {t("emptyDescription")}
                        </p>
                        <Button onClick={() => {
                            setEditing(null);
                            setIsFormOpen(true);
                        }}>
                            <Plus data-icon="inline-start" />
                            {t("addFirst")}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Editorials list */}
            {!isLoading && !editorialsQuery.isError && editorials.length > 0 && (
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
    const lineCount = ed.sourceCode.split("\n").length;
    const t = useTranslations("codingResources.editorials");

    const handleCopy = async () => {
        await navigator.clipboard.writeText(ed.sourceCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="overflow-hidden rounded-xl bg-card shadow-sm ring-border/70">
            <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-border/55 bg-muted/15 px-3 py-2.5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/10">
                            <Code2 />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm">
                                    {t("solutionTitle", {language: langConfig?.label ?? ed.language})}
                                </h3>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {t("lines", {count: lineCount})}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? t("collapse") : t("expand")}>
                            {isExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={handleCopy} title={copied ? t("copied") : t("copy")}>
                            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={onEdit} title={t("edit")}>
                            <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={onDelete} className="text-destructive hover:text-destructive" title={t("delete")}>
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
    const t = useTranslations("codingResources.editorials");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[calc(100svh-2rem)] max-w-7xl overflow-y-auto p-0">
                <DialogHeader className="border-b border-border/50 bg-muted/20 px-6 py-5 pr-14">
                    <DialogTitle>
                        {editorial ? t("editTitle") : t("addTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("dialogDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="px-6 py-5">
                    <EditorialForm
                        defaultValues={editorial ?? undefined}
                        onSubmit={onSubmit}
                        onCancel={() => onOpenChange(false)}
                        isPending={isPending}
                        submitLabel={editorial ? t("saveChanges") : t("add")}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
