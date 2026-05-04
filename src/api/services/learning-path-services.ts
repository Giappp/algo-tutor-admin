import {del, get, getPage, patch, post, put} from "@/api/core/http";
import {CreateLearningPathRequest, LearningPath, UpdateLearningPathRequest,} from "@/types/learning-path";

export interface LearningPathListParams {
    page?: number;
    size?: number;
    level?: string;
    search?: string;
}

export const learningPathService = {
    list: (params?: LearningPathListParams) =>
        getPage<LearningPath>("/api/v1/learning-paths", {params}),

    getById: (id: number) =>
        get<LearningPath>(`/api/v1/learning-paths/${id}`),

    create: (data: CreateLearningPathRequest) =>
        post<LearningPath>("/api/v1/learning-paths", data),

    update: (id: number, data: UpdateLearningPathRequest) =>
        put<LearningPath>(`/api/v1/learning-paths/${id}`, data),

    delete: (id: number) =>
        del<void>(`/api/v1/learning-paths/${id}`),

    togglePublish: (id: number) =>
        patch<void>(`/api/v1/learning-paths/${id}/publish`),
};
