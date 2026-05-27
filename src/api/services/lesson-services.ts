import {del, get, getPage, patch, post, put} from "@/api/core/http";
import {Lesson} from "@/types/learning-path";
import {LessonRequestDTO} from "@/types/learning-path/schema";

export interface LessonListParams {
    page?: number;
    size?: number;
    publishedOnly?: boolean;
}

export const lessonService = {
    listByTopic: (topicId: number, params?: LessonListParams) =>
        getPage<Lesson>(`/api/v1/lessons/topics/${topicId}`, {params}),

    getById: (lessonId: number) =>
        get<Lesson>(`/api/v1/lessons/${lessonId}`),

    getBySlug: (slug: string) =>
        get<Lesson>(`/api/v1/lessons/slug/${slug}`),

    create: (topicId: number, data: LessonRequestDTO) =>
        post<Lesson>(`/api/v1/lessons/topics/${topicId}`, data),

    update: (lessonId: number, data: LessonRequestDTO) =>
        put<Lesson>(`/api/v1/lessons/${lessonId}`, data),

    delete: (lessonId: number) =>
        del<void>(`/api/v1/lessons/${lessonId}`),

    togglePublish: (lessonId: number) =>
        patch<Lesson>(`/api/v1/lessons/${lessonId}/publish`),
};
