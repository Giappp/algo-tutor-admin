"use client";

import {useCallback, useRef, useState} from "react";
import {Eye, Pencil, Columns2} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {MarkdownEditor, MarkdownEditorHandle} from "@/components/ui/markdown-editor";
import {MarkdownToolbar, InsertAction} from "@/components/ui/markdown-toolbar";
import {MarkdownDisplay} from "@/components/ui/markdown-display";

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
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MarkdownSplitEditor({
    value,
    onChange,
    placeholder = "Write markdown content...",
    disabled,
    className,
    minHeight = "400px",
}: MarkdownSplitEditorProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("split");
    const editorRef = useRef<MarkdownEditorHandle>(null);

    const handleInsert = useCallback(
        (action: InsertAction) => {
            editorRef.current?.insert(action);
        },
        []
    );

    return (
        <div
            className={cn(
                "flex flex-col rounded-xl border border-input overflow-hidden",
                className
            )}
        >
            {/* Top bar: Toolbar + View mode toggle */}
            <div className="flex items-center justify-between border-b border-border bg-muted/20">
                <MarkdownToolbar onInsert={handleInsert} disabled={disabled}/>
                <ViewModeToggle value={viewMode} onChange={setViewMode}/>
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
                            placeholder={placeholder}
                            disabled={disabled}
                            minHeight={minHeight}
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
                                Preview will appear here...
                            </p>
                        )}
                    </div>
                )}
            </div>
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
    const modes: {id: ViewMode; icon: React.ElementType; label: string}[] = [
        {id: "edit", icon: Pencil, label: "Editor only"},
        {id: "split", icon: Columns2, label: "Split view"},
        {id: "preview", icon: Eye, label: "Preview only"},
    ];

    return (
        <div className="flex items-center gap-0.5 px-2 py-1.5">
            {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                    <Button
                        key={mode.id}
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        title={mode.label}
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
