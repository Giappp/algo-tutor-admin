"use client";

import {useCallback, useRef, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {useTranslations} from "next-intl";
import {queryKeys} from "@/api/query-keys";
import {videoUploadService} from "@/api/services/video-upload-services";
import type {InitiateVideoUploadResponse, UploadedVideoPart} from "@/types/video-lesson";

const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/quicktime"]);
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024;
const UPLOAD_CONCURRENCY = 4;

type VideoUploadPhase = "idle" | "preparing" | "uploading" | "completing" | "error" | "success" | "aborting";

interface VideoUploadState {
    phase: VideoUploadPhase;
    progress: number;
    fileName?: string;
    error?: string;
    failedPartNumbers: number[];
}

interface UploadSession {
    file: File;
    durationSeconds: number;
    upload: InitiateVideoUploadResponse;
    uploadedParts: Map<number, UploadedVideoPart>;
}

const initialState: VideoUploadState = {
    phase: "idle",
    progress: 0,
    failedPartNumbers: [],
};

function readVideoDuration(file: File, errorMessage: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const objectUrl = URL.createObjectURL(file);
        video.preload = "metadata";
        video.onloadedmetadata = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(Math.ceil(video.duration));
        };
        video.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(errorMessage));
        };
        video.src = objectUrl;
    });
}

function validateVideo(file: File, unsupportedTypeMessage: string, invalidSizeMessage: string) {
    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
        throw new Error(unsupportedTypeMessage);
    }
    if (file.size <= 0 || file.size > MAX_VIDEO_SIZE) {
        throw new Error(invalidSizeMessage);
    }
}

export function useVideoUpload(lessonId: number) {
    const t = useTranslations("lessonForm.video");
    const queryClient = useQueryClient();
    const [state, setState] = useState<VideoUploadState>(initialState);
    const sessionRef = useRef<UploadSession | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    const refreshLesson = useCallback(async () => {
        await queryClient.invalidateQueries({queryKey: queryKeys.lessons.detail(lessonId)});
        await queryClient.invalidateQueries({queryKey: queryKeys.lessons.all});
    }, [lessonId, queryClient]);

    const updateProgress = useCallback(() => {
        const session = sessionRef.current;
        if (!session) return;
        let uploadedBytes = 0;
        for (const partNumber of session.uploadedParts.keys()) {
            const start = (partNumber - 1) * session.upload.partSize;
            uploadedBytes += Math.min(session.upload.partSize, session.file.size - start);
        }
        setState((current) => ({
            ...current,
            progress: Math.min(100, Math.round((uploadedBytes / session.file.size) * 100)),
        }));
    }, []);

    const completeUpload = useCallback(async () => {
        const session = sessionRef.current;
        if (!session) return;
        setState((current) => ({...current, phase: "completing", progress: 100, error: undefined}));
        await videoUploadService.complete(lessonId, {
            uploadId: session.upload.uploadId,
            objectKey: session.upload.objectKey,
            durationSeconds: session.durationSeconds,
            parts: [...session.uploadedParts.values()].sort((a, b) => a.partNumber - b.partNumber),
        });
        sessionRef.current = null;
        controllerRef.current = null;
        setState((current) => ({...current, phase: "success", progress: 100, failedPartNumbers: []}));
        toast.success(t("toast.uploaded"));
        await refreshLesson();
    }, [lessonId, refreshLesson, t]);

    const uploadPartNumbers = useCallback(async (partNumbers: number[]) => {
        const session = sessionRef.current;
        if (!session) return;

        controllerRef.current = new AbortController();
        const controller = controllerRef.current;
        setState((current) => ({...current, phase: "uploading", error: undefined, failedPartNumbers: []}));

        const presignedParts = await videoUploadService.presignParts(lessonId, {
            uploadId: session.upload.uploadId,
            objectKey: session.upload.objectKey,
            partNumbers,
        });
        const queue = [...presignedParts];
        const failed: number[] = [];

        const worker = async () => {
            while (queue.length > 0 && !controller.signal.aborted) {
                const part = queue.shift();
                if (!part) return;
                try {
                    const start = (part.partNumber - 1) * session.upload.partSize;
                    const blob = session.file.slice(start, Math.min(start + session.upload.partSize, session.file.size));
                    const response = await fetch(part.uploadUrl, {
                        method: "PUT",
                        body: blob,
                        signal: controller.signal,
                    });
                    if (!response.ok) throw new Error(`Part ${part.partNumber} failed.`);
                    const eTag = response.headers.get("ETag");
                    if (!eTag) throw new Error("S3 did not expose the ETag header.");
                    session.uploadedParts.set(part.partNumber, {partNumber: part.partNumber, eTag});
                    updateProgress();
                } catch {
                    if (!controller.signal.aborted) failed.push(part.partNumber);
                }
            }
        };

        await Promise.all(Array.from(
            {length: Math.min(UPLOAD_CONCURRENCY, queue.length)},
            () => worker(),
        ));

        if (controller.signal.aborted) return;
        if (failed.length > 0) {
            setState((current) => ({
                ...current,
                phase: "error",
                error: t("errors.partsFailed", {count: failed.length}),
                failedPartNumbers: failed.sort((a, b) => a - b),
            }));
            return;
        }
        await completeUpload();
    }, [completeUpload, lessonId, t, updateProgress]);

    const start = useCallback(async (file: File) => {
        try {
            validateVideo(file, t("errors.unsupportedType"), t("errors.invalidSize"));
            setState({phase: "preparing", progress: 0, fileName: file.name, failedPartNumbers: []});
            const durationSeconds = await readVideoDuration(file, t("errors.duration"));
            const upload = await videoUploadService.initiate(lessonId, {
                fileName: file.name,
                contentType: file.type,
                fileSize: file.size,
            });
            sessionRef.current = {file, durationSeconds, upload, uploadedParts: new Map()};
            await refreshLesson();
            await uploadPartNumbers(Array.from({length: upload.totalParts}, (_, index) => index + 1));
        } catch (error) {
            const message = error instanceof Error ? error.message : t("errors.uploadFailed");
            setState((current) => ({...current, phase: "error", error: message}));
            toast.error(message);
        }
    }, [lessonId, refreshLesson, t, uploadPartNumbers]);

    const retry = useCallback(async () => {
        if (state.failedPartNumbers.length === 0) return;
        try {
            await uploadPartNumbers(state.failedPartNumbers);
        } catch (error) {
            const message = error instanceof Error ? error.message : t("errors.retryFailed");
            setState((current) => ({...current, phase: "error", error: message}));
            toast.error(message);
        }
    }, [state.failedPartNumbers, t, uploadPartNumbers]);

    const abort = useCallback(async () => {
        const session = sessionRef.current;
        if (!session) {
            setState(initialState);
            return;
        }
        controllerRef.current?.abort();
        setState((current) => ({...current, phase: "aborting", error: undefined}));
        try {
            await videoUploadService.abort(lessonId, {
                uploadId: session.upload.uploadId,
                objectKey: session.upload.objectKey,
            });
            sessionRef.current = null;
            controllerRef.current = null;
            setState(initialState);
            toast.success(t("toast.cancelled"));
            await refreshLesson();
        } catch (error) {
            const message = error instanceof Error ? error.message : t("errors.cancelFailed");
            setState((current) => ({...current, phase: "error", error: message}));
            toast.error(message);
        }
    }, [lessonId, refreshLesson, t]);

    return {
        ...state,
        start,
        retry,
        abort,
        isBusy: ["preparing", "uploading", "completing", "aborting"].includes(state.phase),
    };
}
