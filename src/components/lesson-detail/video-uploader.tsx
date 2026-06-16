"use client";

import {useRef} from "react";
import {useTranslations} from "next-intl";
import {AlertCircle, CheckCircle2, FileVideo, Loader2, RotateCcw, Upload, X} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Progress} from "@/components/ui/progress";
import {useVideoUpload} from "@/hooks/use-video-upload";
import type {Lesson} from "@/types/learning-path";

interface VideoUploaderProps {
    lesson: Lesson;
    lessonId: number;
}

function formatBytes(bytes?: number | null) {
    if (!bytes) return null;
    const units = ["B", "KiB", "MiB", "GiB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDuration(seconds?: number | null) {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function VideoUploader({lesson, lessonId}: VideoUploaderProps) {
    const t = useTranslations("lessonForm.video");
    const inputRef = useRef<HTMLInputElement>(null);
    const upload = useVideoUpload(lessonId);
    const processingStatus = lesson.processingStatus ?? "PENDING_UPLOAD";

    const handleFile = (file?: File) => {
        if (file) void upload.start(file);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <Card>
            <CardHeader className="border-b border-border/60">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileVideo className="size-4 text-primary"/>
                            {t("sourceTitle")}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {t("sourceDescription")}
                        </CardDescription>
                    </div>
                    <Badge variant="outline">{t(`processingStatus.${processingStatus}`)}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                {processingStatus === "READY" && upload.phase === "idle" && (
                    <div className="grid gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 sm:grid-cols-3">
                        <div><p className="text-xs text-muted-foreground">{t("fileSize")}</p><p className="mt-1 font-medium">{formatBytes(lesson.fileSizeBytes) ?? t("notAvailable")}</p></div>
                        <div><p className="text-xs text-muted-foreground">{t("duration")}</p><p className="mt-1 font-medium">{formatDuration(lesson.durationSeconds) ?? t("notAvailable")}</p></div>
                        <div><p className="text-xs text-muted-foreground">{t("mimeType")}</p><p className="mt-1 font-medium">{lesson.mimeType ?? t("notAvailable")}</p></div>
                    </div>
                )}

                {upload.phase !== "idle" && (
                    <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4" aria-live="polite">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{upload.fileName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {upload.phase === "preparing" && t("phase.preparing")}
                                    {upload.phase === "uploading" && t("phase.uploading", {progress: upload.progress})}
                                    {upload.phase === "completing" && t("phase.completing")}
                                    {upload.phase === "aborting" && t("phase.aborting")}
                                    {upload.phase === "success" && t("phase.success")}
                                    {upload.phase === "error" && upload.error}
                                </p>
                            </div>
                            {upload.isBusy && <Loader2 className="size-4 shrink-0 animate-spin text-primary"/>}
                            {upload.phase === "success" && <CheckCircle2 className="size-4 shrink-0 text-emerald-500"/>}
                            {upload.phase === "error" && <AlertCircle className="size-4 shrink-0 text-destructive"/>}
                        </div>
                        <Progress value={upload.progress} aria-label={t("progressLabel")}/>
                        <div className="flex flex-wrap gap-2">
                            {upload.phase === "error" && upload.failedPartNumbers.length > 0 && (
                                <Button type="button" variant="outline" size="sm" onClick={() => void upload.retry()}>
                                    <RotateCcw className="size-4"/>
                                    {t("retryFailedParts")}
                                </Button>
                            )}
                            {upload.phase !== "success" && upload.phase !== "preparing" && (
                                <Button type="button" variant="ghost" size="sm" disabled={upload.phase === "aborting"} onClick={() => void upload.abort()}>
                                    <X className="size-4"/>
                                    {t("cancelUpload")}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium">
                            {processingStatus === "READY" ? t("replaceSource") : t("uploadSource")}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t("publishHint")}
                        </p>
                    </div>
                    <Input
                        ref={inputRef}
                        type="file"
                        accept="video/mp4,video/quicktime"
                        disabled={upload.isBusy || upload.phase === "error"}
                        className="sr-only"
                        aria-label={t("chooseVideo")}
                        onChange={(event) => handleFile(event.target.files?.[0])}
                    />
                    <Button type="button" variant="outline" disabled={upload.isBusy || upload.phase === "error"} onClick={() => inputRef.current?.click()}>
                        <Upload className="size-4"/>
                        {t("chooseVideo")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
