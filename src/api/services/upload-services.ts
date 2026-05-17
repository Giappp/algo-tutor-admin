import { api } from "@/api/core/http";
import { postForm } from "@/api/core/http";

export interface UploadResponse {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

export interface ImageUploadResult {
    imageUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

export const uploadService = {
    async uploadImage(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append("file", file);
        return await postForm<UploadResponse>("/api/v1/upload/images", formData);
    },

    async uploadImageWithProgress(
        file: File,
        onProgress?: (percent: number) => void
    ): Promise<ImageUploadResult> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post<{ success: boolean; data: { imageUrl: string } }>(
            "/upload/images",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percent = Math.round(
                            (progressEvent.loaded / progressEvent.total) * 100
                        );
                        onProgress(percent);
                    }
                },
            }
        );

        return {
            imageUrl: response.data.data.imageUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
        };
    },
};
