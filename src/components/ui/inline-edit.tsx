"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
    value: string;
    onSave: (value: string) => void;
    /** Render the display text (default: h1) */
    className?: string;
    inputClassName?: string;
    placeholder?: string;
    disabled?: boolean;
    /** Validate before saving. Return error message or undefined. */
    validate?: (value: string) => string | undefined;
}

/**
 * Click-to-edit inline text component.
 * Shows text normally, click or press pencil icon to enter edit mode.
 * Press Enter or click check to save, Escape or X to cancel.
 */
export function InlineEdit({
    value,
    onSave,
    className,
    inputClassName,
    placeholder = "Enter text...",
    disabled = false,
    validate,
}: InlineEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [prevValue, setPrevValue] = useState(value);
    const [error, setError] = useState<string | undefined>();
    const inputRef = useRef<HTMLInputElement>(null);

    if (value !== prevValue) {
        setPrevValue(value);
        if (!isEditing) {
            setEditValue(value);
        }
    }

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const startEditing = useCallback(() => {
        if (disabled) return;
        setIsEditing(true);
        setEditValue(value);
        setError(undefined);
    }, [disabled, value]);

    const cancelEditing = useCallback(() => {
        setIsEditing(false);
        setEditValue(value);
        setError(undefined);
    }, [value]);

    const saveEdit = useCallback(() => {
        const trimmed = editValue.trim();
        if (!trimmed) {
            setError("Cannot be empty");
            return;
        }
        if (validate) {
            const validationError = validate(trimmed);
            if (validationError) {
                setError(validationError);
                return;
            }
        }
        if (trimmed !== value) {
            onSave(trimmed);
        }
        setIsEditing(false);
        setError(undefined);
    }, [editValue, value, onSave, validate]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                saveEdit();
            } else if (e.key === "Escape") {
                cancelEditing();
            }
        },
        [saveEdit, cancelEditing]
    );

    if (isEditing) {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => {
                            setEditValue(e.target.value);
                            setError(undefined);
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        placeholder={placeholder}
                        className={cn(
                            "flex-1 bg-background border border-input rounded-lg px-3 py-1.5 text-lg font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-ring/50",
                            error && "border-destructive focus:ring-destructive/50",
                            inputClassName
                        )}
                    />
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={saveEdit}
                        className="shrink-0 flex items-center justify-center size-7 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                        title="Save (Enter)"
                    >
                        <Check className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={cancelEditing}
                        className="shrink-0 flex items-center justify-center size-7 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                        title="Cancel (Escape)"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>
                {error && (
                    <p className="text-xs text-destructive pl-1">{error}</p>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "group flex items-center gap-2 cursor-pointer rounded-lg -mx-1 px-1 py-0.5 hover:bg-muted/50 transition-colors",
                disabled && "cursor-default hover:bg-transparent"
            )}
            onClick={startEditing}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    startEditing();
                }
            }}
            title={disabled ? undefined : "Click to edit"}
        >
            <span className={cn("text-2xl font-bold tracking-tight text-foreground truncate max-w-md", className)}>
                {value || <span className="text-muted-foreground italic">{placeholder}</span>}
            </span>
            {!disabled && (
                <Pencil className="size-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
            )}
        </div>
    );
}
