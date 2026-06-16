import type {VideoProcessingStatus} from "@/types/learning-path";

export interface InitiateVideoUploadRequest {
    fileName: string;
    contentType: string;
    fileSize: number;
}

export interface InitiateVideoUploadResponse {
    uploadId: string;
    objectKey: string;
    partSize: number;
    totalParts: number;
}

export interface PresignVideoPartsRequest {
    uploadId: string;
    objectKey: string;
    partNumbers: number[];
}

export interface PresignedVideoPart {
    partNumber: number;
    uploadUrl: string;
}

export interface UploadedVideoPart {
    partNumber: number;
    eTag: string;
}

export interface CompleteVideoUploadRequest {
    uploadId: string;
    objectKey: string;
    durationSeconds: number;
    parts: UploadedVideoPart[];
}

export interface CompleteVideoUploadResponse {
    lessonId: number;
    objectKey: string;
    fileSize: number;
    contentType: string;
    durationSeconds: number;
    processingStatus: VideoProcessingStatus;
}

export interface AbortVideoUploadRequest {
    uploadId: string;
    objectKey: string;
}
