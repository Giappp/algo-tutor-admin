"use client";

import { useCallback, useRef, useState } from "react";
import { Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useImageUpload } from "@/hooks/use-image-upload";

interface ImageUploaderProps {
    value?: string;
    onChange?: (url: string) => void;
    onRemove?: () => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    aspectRatio?: "video" | "square" | "portrait";
    className?: string;
    maxSizeMB?: number;
    acceptedTypes?: string[];
}

const ACCEPTED_DISPLAY = ["JPG", "PNG", "WEBP", "GIF"];

const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
};

function CircularProgress({ percent, size = 80 }: { percent: number; size?: number }) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-primary transition-all duration-200 ease-linear"
                />
            </svg>
            <span className="absolute text-sm font-semibold text-foreground">{percent}%</span>
        </div>
    );
}

export function ImageUploader({
    value,
    onChange,
    onRemove,
    onError,
    disabled = false,
    aspectRatio = "video",
    className,
    maxSizeMB,
    acceptedTypes,
}: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const { previewUrl, progress, isUploading, error, handleFile, reset } = useImageUpload({
        maxSizeMB,
        acceptedTypes,
        onSuccess: (imageUrl) => {
            onChange?.(imageUrl);
        },
        onError: (errMsg) => {
            onError?.(errMsg);
        },
    });

    const showPreview = previewUrl || value;

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (disabled || isUploading) return;

            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [disabled, isUploading, handleFile]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = "";
    };

    const handleRemove = () => {
        reset();
        onChange?.("");
        onRemove?.();
    };

    if (showPreview) {
        return (
            <div className={cn("relative group rounded-xl overflow-hidden border bg-muted", className)}>
                <Image
                    src={previewUrl || value || ""}
                    alt="Uploaded image"
                    fill
                    className={cn(
                        "object-cover",
                        isUploading && "opacity-40 blur-sm scale-105 transition-all duration-300"
                    )}
                />
                {isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <CircularProgress percent={progress} size={88} />
                        <Progress value={progress} className="w-3/4 max-w-[200px]" />
                        <p className="text-sm font-medium text-foreground/80">Uploading...</p>
                    </div>
                )}
                {!isUploading && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => inputRef.current?.click()}
                            disabled={disabled}
                            className="pointer-events-auto"
                        >
                            <UploadCloud className="size-4" data-icon="inline-start" />
                            Change
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleRemove}
                            disabled={disabled}
                            className="pointer-events-auto"
                        >
                            <Trash2 className="size-4" data-icon="inline-start" />
                            Remove
                        </Button>
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={acceptedTypes?.join(",") || "image/jpeg,image/png,image/webp,image/gif"}
                    onChange={handleChange}
                    disabled={disabled}
                    className="hidden"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => !disabled && !isUploading && inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (!disabled && !isUploading) inputRef.current?.click();
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled && !isUploading) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none",
                    aspectClasses[aspectRatio],
                    isDragging
                        ? "border-chart-1 bg-chart-1/5"
                        : "border-border hover:border-chart-1/40 hover:bg-muted/50",
                    (disabled || isUploading) && "opacity-50 cursor-not-allowed",
                    error && "border-destructive/50",
                    className
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={acceptedTypes?.join(",") || "image/jpeg,image/png,image/webp,image/gif"}
                    onChange={handleChange}
                    disabled={disabled || isUploading}
                    className="hidden"
                />

                <div
                    className={cn(
                        "flex items-center justify-center size-12 rounded-2xl transition-colors",
                        isDragging ? "bg-chart-1/10 text-chart-1" : "bg-muted text-muted-foreground"
                    )}
                >
                    <UploadCloud className="size-5" />
                </div>

                <div className="text-center px-4">
                    <p className="text-sm font-semibold text-foreground">
                        {isDragging ? "Drop image here" : "Click or drag to upload"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {ACCEPTED_DISPLAY.join(", ")} &middot; Max {maxSizeMB ?? 5}MB
                    </p>
                </div>
            </div>

            {error && (
                <p className="text-xs text-destructive pl-1">{error}</p>
            )}
        </div>
    );
}
