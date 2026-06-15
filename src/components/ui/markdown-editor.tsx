"use client";

import {forwardRef, useCallback, useImperativeHandle, useMemo, useRef} from "react";
import CodeMirror, {EditorView, ReactCodeMirrorRef} from "@uiw/react-codemirror";
import {markdown, markdownLanguage} from "@codemirror/lang-markdown";
import {languages} from "@codemirror/language-data";
import {useTheme} from "next-themes";
import {cn} from "@/lib/utils";
import {InsertAction} from "@/components/ui/markdown-toolbar";

// ---------------------------------------------------------------------------
// Public handle
// ---------------------------------------------------------------------------

export interface MarkdownEditorHandle {
    /** Insert text at the current cursor position, wrapping any selection */
    insert: (action: InsertAction) => void;
    /** Replace the current selection, or insert at the cursor */
    replaceSelection: (content: string) => void;
    /** Return the current selected text */
    getSelection: () => string;
    /** Focus the editor */
    focus: () => void;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    minHeight?: string;
    onImageFile?: (file: File) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
    function MarkdownEditor(
        {
            value,
            onChange,
            placeholder = "Write markdown content...",
            disabled,
            className,
            minHeight = "320px",
            onImageFile,
        },
        ref
    ) {
        const {resolvedTheme} = useTheme();
        const cmRef = useRef<ReactCodeMirrorRef>(null);

        const extensions = useMemo(
            () => [
                markdown({base: markdownLanguage, codeLanguages: languages}),
                EditorView.lineWrapping,
                EditorView.theme({
                    "&": {fontSize: "14px"},
                    ".cm-content": {padding: "12px 16px", fontFamily: "var(--font-mono, monospace)"},
                    ".cm-gutters": {border: "none", background: "transparent"},
                    ".cm-placeholder": {color: "hsl(var(--muted-foreground))"},
                }),
                EditorView.domEventHandlers({
                    paste(event) {
                        const image = Array.from(event.clipboardData?.files ?? [])
                            .find((file) => file.type.startsWith("image/"));
                        if (!image || !onImageFile) return false;
                        event.preventDefault();
                        onImageFile(image);
                        return true;
                    },
                    drop(event) {
                        const image = Array.from(event.dataTransfer?.files ?? [])
                            .find((file) => file.type.startsWith("image/"));
                        if (!image || !onImageFile) return false;
                        event.preventDefault();
                        onImageFile(image);
                        return true;
                    },
                }),
            ],
            [onImageFile]
        );

        const handleChange = useCallback(
            (val: string) => {
                onChange(val);
            },
            [onChange]
        );

        useImperativeHandle(ref, () => ({
            insert: (action: InsertAction) => {
                const view = cmRef.current?.view;
                if (!view) return;

                const {from, to} = view.state.selection.main;
                const selectedText = view.state.sliceDoc(from, to);
                const insertText = selectedText || action.placeholder || "";
                const replacement = `${action.before}${insertText}${action.after}`;

                view.dispatch({
                    changes: {from, to, insert: replacement},
                    selection: {
                        anchor: from + action.before.length,
                        head: from + action.before.length + insertText.length,
                    },
                });
                view.focus();
            },
            replaceSelection: (content: string) => {
                const view = cmRef.current?.view;
                if (!view) return;

                const {from, to} = view.state.selection.main;
                view.dispatch({
                    changes: {from, to, insert: content},
                    selection: {anchor: from + content.length},
                });
                view.focus();
            },
            getSelection: () => {
                const view = cmRef.current?.view;
                if (!view) return "";
                const {from, to} = view.state.selection.main;
                return view.state.sliceDoc(from, to);
            },
            focus: () => {
                cmRef.current?.view?.focus();
            },
        }));

        return (
            <div
                className={cn(
                    "overflow-hidden bg-background",
                    disabled && "opacity-60 pointer-events-none",
                    className
                )}
            >
                <CodeMirror
                    ref={cmRef}
                    value={value}
                    onChange={handleChange}
                    extensions={extensions}
                    theme={resolvedTheme === "dark" ? "dark" : "light"}
                    placeholder={placeholder}
                    editable={!disabled}
                    minHeight={minHeight}
                    basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                        highlightActiveLine: true,
                        bracketMatching: true,
                        autocompletion: false,
                    }}
                />
            </div>
        );
    }
);
