"use client";

import {useCallback, useRef, useState} from "react";
import {ImageIcon, Trash2, UploadCloud, X} from "lucide-react";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {uploadService} from "@/api/services/upload-services";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
    disabled?: boolean;
    aspectRatio?: "video" | "square" | "portrait";
    className?: string;
}

export function ImageUpload({
                                value,
                                onChange,
                                onRemove,
                                disabled = false,
                                aspectRatio = "video",
                                className,
                            }: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const aspectClasses = {
        video: "aspect-video",
        square: "aspect-square",
        portrait: "aspect-[3/4]",
    };

    const validateFile = (file: File): string | null => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return `File type not supported. Use: ${ACCEPTED_TYPES.map((t) => t.split("/")[1].toUpperCase()).join(", ")}`;
        }
        if (file.size > MAX_SIZE_BYTES) {
            return `File too large. Maximum ${MAX_SIZE_MB}MB.`;
        }
        return null;
    };

    const uploadFile = async (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setIsUploading(true);

        try {
            const result = await uploadService.uploadImage(file);
            onChange(result.url);
        } catch {
            setError("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (disabled || isUploading) return;

            const file = e.dataTransfer.files[0];
            if (file) uploadFile(file);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [disabled, isUploading]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
        e.target.value = "";
    };

    const handleRemove = () => {
        onChange("");
        onRemove?.();
        setError(null);
    };

    // ─── Preview state (image uploaded) ──────────────────────────────────────
    if (value) {
        return (
            <div className={cn("flex flex-col gap-2", className)}>
                <div className={cn(
                    "relative rounded-lg overflow-hidden border bg-muted",
                    aspectClasses[aspectRatio]
                )}>
                    <Image
                        src={value}
                        alt="Uploaded image"
                        fill
                        className="object-cover"
                        unoptimized
                    />

                    {/* Hover overlay with actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-colors hover:bg-black/50 hover:opacity-100 focus-within:bg-black/50 focus-within:opacity-100">
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => inputRef.current?.click()}
                            disabled={disabled || isUploading}
                        >
                            <UploadCloud className="size-4 mr-1.5"/>
                            Change
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={handleRemove}
                            disabled={disabled}
                        >
                            <Trash2 className="size-4 mr-1.5"/>
                            Remove
                        </Button>
                    </div>
                </div>

                {/* URL display */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ImageIcon className="size-3.5 shrink-0"/>
                    <span className="truncate">{value}</span>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    onChange={handleChange}
                    className="hidden"
                />
            </div>
        );
    }

    // ─── Upload state (no image) ─────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-2">
            <div
                onClick={() => !disabled && !isUploading && inputRef.current?.click()}
                onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === " ") && !disabled && !isUploading) {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled && !isUploading) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={disabled || isUploading ? -1 : 0}
                aria-disabled={disabled || isUploading}
                aria-label="Upload cover image"
                className={cn(
                    "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
                    aspectClasses[aspectRatio],
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/50",
                    (disabled || isUploading) && "opacity-50 cursor-not-allowed",
                    error && "border-destructive/50",
                    className
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    onChange={handleChange}
                    disabled={disabled || isUploading}
                    className="hidden"
                />

                {isUploading ? (
                    <>
                        <div className="size-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"/>
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                    </>
                ) : (
                    <>
                        <div
                            className={cn(
                                "flex items-center justify-center size-10 rounded-lg transition-colors",
                                isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}
                        >
                            <UploadCloud className="size-5"/>
                        </div>
                        <div className="text-center px-4">
                            <p className="text-sm font-medium text-foreground">
                                {isDragging ? "Drop image here" : "Click or drag to upload"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {ACCEPTED_TYPES.map((t) => t.split("/")[1].toUpperCase()).join(", ")} · Max {MAX_SIZE_MB}MB
                            </p>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-1.5 text-destructive">
                    <X className="size-3.5 shrink-0"/>
                    <p className="text-xs">{error}</p>
                </div>
            )}
        </div>
    );
}
