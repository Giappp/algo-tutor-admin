"use client";

import {useCallback, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {Columns2, Eye, ImageIcon, Pencil, Sparkles} from "lucide-react";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {MarkdownEditor, MarkdownEditorHandle} from "@/components/ui/markdown-editor";
import {MarkdownToolbar, InsertAction} from "@/components/ui/markdown-toolbar";
import {MarkdownDisplay} from "@/components/ui/markdown-display";
import {
    MarkdownAiAssistant,
    MarkdownAiRequest,
} from "@/components/ui/markdown-ai-assistant";
import {uploadService} from "@/api/services/upload-services";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewMode = "edit" | "preview" | "split";

interface MarkdownSplitEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    minHeight?: string;
    onAiGenerate?: (request: MarkdownAiRequest) => Promise<string>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MarkdownSplitEditor({
    value,
    onChange,
    placeholder,
    disabled,
    className,
    minHeight = "400px",
    onAiGenerate,
}: MarkdownSplitEditorProps) {
    const t = useTranslations("lessonForm");
    const [viewMode, setViewMode] = useState<ViewMode>("split");
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiSelection, setAiSelection] = useState("");
    const editorRef = useRef<MarkdownEditorHandle>(null);
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

    const handleInsert = useCallback(
        (action: InsertAction) => {
            editorRef.current?.insert(action);
        },
        []
    );

    const handleImageFile = useCallback(async (file: File) => {
        if (isUploadingImage) return;
        setIsUploadingImage(true);
        try {
            const result = await uploadService.uploadImage(file);
            editorRef.current?.insert({
                before: `![${file.name.replace(/\.[^.]+$/, "")}](${result.url})`,
                after: "",
            });
            toast.success(t("markdown.imageUploaded"));
        } catch {
            toast.error(t("markdown.imageUploadFailed"));
        } finally {
            setIsUploadingImage(false);
        }
    }, [isUploadingImage, t]);

    const openAiAssistant = () => {
        setAiSelection(editorRef.current?.getSelection() ?? "");
        setIsAiOpen(true);
    };

    return (
        <div
            className={cn(
                "group/editor flex flex-col overflow-hidden rounded-2xl border border-input bg-card shadow-[0_14px_45px_-38px_rgba(15,23,42,0.65)] transition-shadow focus-within:border-primary/35 focus-within:shadow-[0_18px_55px_-38px_oklch(0.56_0.18_252/0.8)]",
                className
            )}
        >
            {/* Top bar: Toolbar + View mode toggle */}
            <div className="flex items-center justify-between border-b border-border bg-muted/20">
                <MarkdownToolbar
                    onInsert={handleInsert}
                    onImageFile={handleImageFile}
                    isUploadingImage={isUploadingImage}
                    disabled={disabled}
                />
                <div className="flex shrink-0 items-center gap-1 border-l border-border/70 px-2">
                    {onAiGenerate && (
                        <Button
                            type="button"
                            variant="ai"
                            size="xs"
                            onClick={openAiAssistant}
                            disabled={disabled}
                            className="h-7"
                        >
                            <Sparkles className="size-3.5"/>
                            <span className="hidden sm:inline">{t("markdown.ai.trigger")}</span>
                        </Button>
                    )}
                    <ViewModeToggle value={viewMode} onChange={setViewMode}/>
                </div>
            </div>

            {/* Content area */}
            <div
                className="flex flex-1 overflow-hidden"
                style={{minHeight}}
            >
                {/* Editor pane */}
                {(viewMode === "edit" || viewMode === "split") && (
                    <div
                        className={cn(
                            "flex-1 overflow-auto",
                            viewMode === "split" && "border-r border-border"
                        )}
                    >
                        <MarkdownEditor
                            ref={editorRef}
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder ?? t("markdown.placeholder")}
                            disabled={disabled}
                            minHeight={minHeight}
                            onImageFile={handleImageFile}
                        />
                    </div>
                )}

                {/* Preview pane */}
                {(viewMode === "preview" || viewMode === "split") && (
                    <div className="flex-1 overflow-auto p-5">
                        {value.trim() ? (
                            <MarkdownDisplay content={value}/>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">
                                {t("markdown.emptyPreview")}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex min-h-9 items-center justify-between gap-3 border-t border-border/70 bg-muted/15 px-3 py-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <ImageIcon className="size-3.5"/>
                    <span>{isUploadingImage ? t("markdown.uploadingImage") : t("markdown.imageHint")}</span>
                </div>
                <div className="shrink-0 font-mono tabular-nums">
                    {t("markdown.counts", {words: wordCount, characters: value.length})}
                </div>
            </div>

            {onAiGenerate && (
                <MarkdownAiAssistant
                    open={isAiOpen}
                    onOpenChange={setIsAiOpen}
                    content={value}
                    selection={aiSelection}
                    onGenerate={onAiGenerate}
                    onApply={(content, replaceDocument) => {
                        if (replaceDocument) {
                            onChange(content);
                            return;
                        }
                        editorRef.current?.replaceSelection(content);
                    }}
                />
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// View Mode Toggle
// ---------------------------------------------------------------------------

interface ViewModeToggleProps {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
}

function ViewModeToggle({value, onChange}: ViewModeToggleProps) {
    const t = useTranslations("lessonForm");
    const modes: {id: ViewMode; icon: React.ElementType; label: string}[] = [
        {id: "edit", icon: Pencil, label: t("markdown.editorOnly")},
        {id: "split", icon: Columns2, label: t("markdown.splitView")},
        {id: "preview", icon: Eye, label: t("markdown.previewOnly")},
    ];

    return (
        <div className="flex items-center gap-0.5 py-1.5" role="group" aria-label={t("markdown.viewMode")}>
            {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                    <Button
                        key={mode.id}
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        title={mode.label}
                        aria-label={mode.label}
                        aria-pressed={value === mode.id}
                        onClick={() => onChange(mode.id)}
                        className={cn(
                            "size-7 rounded-md",
                            value === mode.id && "bg-accent text-accent-foreground"
                        )}
                    >
                        <Icon className="size-3.5"/>
                    </Button>
                );
            })}
        </div>
    );
}
