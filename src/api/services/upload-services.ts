import {postForm} from "@/api/core/http";

export interface UploadResponse {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

export const uploadService = {
    async uploadImage(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append("file", file);
        return await postForm<UploadResponse>("/api/uploads/images", formData);
    },
};
