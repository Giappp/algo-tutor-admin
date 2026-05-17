"use client";

import {useCallback, useRef, useState} from "react";
import {Trash2, UploadCloud, X} from "lucide-react";
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
            return `File type not supported. Please use: ${ACCEPTED_TYPES.map((t) => t.split("/")[1].toUpperCase()).join(", ")}`;
        }
        if (file.size > MAX_SIZE_BYTES) {
            return `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
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
        [disabled, isUploading, uploadFile]
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

    if (value) {
        return (
            <div className={cn("relative group rounded-xl overflow-hidden border bg-muted", className)}>
                <Image
                    src={value}
                    alt="Uploaded image"
                    fill
                    className="object-cover w-full h-full"
                />
                <div
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled || isUploading}
                        className="pointer-events-auto"
                    >
                        <UploadCloud className="size-4 mr-1.5"/>
                        Change
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleRemove}
                        disabled={disabled}
                        className="pointer-events-auto"
                    >
                        <Trash2 className="size-4 mr-1.5"/>
                        Remove
                    </Button>
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

    return (
        <div className="flex flex-col gap-2">
            <div
                onClick={() => !disabled && !isUploading && inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled && !isUploading) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
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
                    accept={ACCEPTED_TYPES.join(",")}
                    onChange={handleChange}
                    disabled={disabled || isUploading}
                    className="hidden"
                />

                {isUploading ? (
                    <>
                        <div className="size-10 rounded-full border-2 border-chart-1/30 border-t-chart-1 animate-spin"/>
                        <p className="text-sm text-muted-foreground font-medium">Uploading...</p>
                    </>
                ) : (
                    <>
                        <div
                            className={cn(
                                "flex items-center justify-center size-12 rounded-2xl transition-colors",
                                isDragging ? "bg-chart-1/10 text-chart-1" : "bg-muted text-muted-foreground"
                            )}
                        >
                            <UploadCloud className="size-5"/>
                        </div>
                        <div className="text-center px-4">
                            <p className="text-sm font-semibold text-foreground">
                                {isDragging ? "Drop image here" : "Click or drag to upload"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {ACCEPTED_TYPES.map((t) => t.split("/")[1].toUpperCase()).join(", ")} &middot; Max {MAX_SIZE_MB}MB
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
