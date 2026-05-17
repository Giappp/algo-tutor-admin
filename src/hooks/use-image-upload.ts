"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uploadService } from "@/api/services/upload-services";

const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DEFAULT_MAX_SIZE_MB = 5;

export interface UseImageUploadOptions {
    maxSizeMB?: number;
    acceptedTypes?: string[];
    onSuccess?: (imageUrl: string) => void;
    onError?: (error: string) => void;
}

export interface UseImageUploadReturn {
    file: File | null;
    previewUrl: string | null;
    progress: number;
    isUploading: boolean;
    error: string | null;
    handleFile: (file: File) => void;
    reset: () => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
    const {
        maxSizeMB = DEFAULT_MAX_SIZE_MB,
        acceptedTypes = DEFAULT_ACCEPTED_TYPES,
        onSuccess,
        onError,
    } = options;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const previewUrlRef = useRef<string | null>(null);

    const revokePreviewUrl = useCallback(() => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }
        setPreviewUrl(null);
    }, []);

    useEffect(() => {
        return () => {
            revokePreviewUrl();
        };
    }, [revokePreviewUrl]);

    const validateFile = useCallback(
        (f: File): string | null => {
            if (!acceptedTypes.includes(f.type)) {
                return `File type not supported. Please use: ${acceptedTypes
                    .map((t) => t.split("/")[1].toUpperCase())
                    .join(", ")}`;
            }
            if (f.size > maxSizeBytes) {
                return `File is too large. Maximum size is ${maxSizeMB}MB.`;
            }
            return null;
        },
        [acceptedTypes, maxSizeBytes, maxSizeMB]
    );

    const upload = useCallback(
        async (selectedFile: File) => {
            const validationError = validateFile(selectedFile);
            if (validationError) {
                setError(validationError);
                onError?.(validationError);
                return;
            }

            revokePreviewUrl();

            const objectUrl = URL.createObjectURL(selectedFile);
            previewUrlRef.current = objectUrl;
            setPreviewUrl(objectUrl);
            setFile(selectedFile);
            setError(null);
            setProgress(0);
            setIsUploading(true);

            try {
                const result = await uploadService.uploadImageWithProgress(
                    selectedFile,
                    (percent) => {
                        setProgress(percent);
                    }
                );
                setProgress(100);
                onSuccess?.(result.imageUrl);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
                setError(message);
                onError?.(message);
            } finally {
                setIsUploading(false);
            }
        },
        [validateFile, revokePreviewUrl, onSuccess, onError]
    );

    const handleFile = useCallback(
        (f: File) => {
            upload(f);
        },
        [upload]
    );

    const reset = useCallback(() => {
        setFile(null);
        revokePreviewUrl();
        setProgress(0);
        setIsUploading(false);
        setError(null);
    }, [revokePreviewUrl]);

    return {
        file,
        previewUrl,
        progress,
        isUploading,
        error,
        handleFile,
        reset,
    };
}
