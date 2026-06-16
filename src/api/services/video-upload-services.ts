import {del, post} from "@/api/core/http";
import type {
    AbortVideoUploadRequest,
    CompleteVideoUploadRequest,
    CompleteVideoUploadResponse,
    InitiateVideoUploadRequest,
    InitiateVideoUploadResponse,
    PresignedVideoPart,
    PresignVideoPartsRequest,
} from "@/types/video-lesson";

export const videoUploadService = {
    initiate: (lessonId: number, data: InitiateVideoUploadRequest) =>
        post<InitiateVideoUploadResponse>(`/api/v1/lessons/${lessonId}/video/uploads`, data),

    presignParts: (lessonId: number, data: PresignVideoPartsRequest) =>
        post<PresignedVideoPart[]>(`/api/v1/lessons/${lessonId}/video/uploads/parts`, data),

    complete: (lessonId: number, data: CompleteVideoUploadRequest) =>
        post<CompleteVideoUploadResponse>(`/api/v1/lessons/${lessonId}/video/uploads/complete`, data),

    abort: (lessonId: number, data: AbortVideoUploadRequest) =>
        del<void>(`/api/v1/lessons/${lessonId}/video/uploads`, {data}),
};
