import {del, get, patch, post, put} from "@/api/core/http";
import {CreateLessonRequest, Lesson, UpdateLessonRequest} from "@/types/learning-path";

export const lessonService = {
    listByTopic: (topicId: number, publishedOnly = false) =>
        get<Lesson>(`/api/v1/lessons/topics/${topicId}`, {
            params: {publishedOnly},
        }),

    getById: (lessonId: number) =>
        get<Lesson>(`/api/v1/lessons/${lessonId}`),

    getBySlug: (slug: string) =>
        get<Lesson>(`/api/v1/lessons/slug/${slug}`),

    create: (topicId: number, data: CreateLessonRequest) =>
        post<Lesson>(`/api/v1/lessons/topics/${topicId}`, data),

    update: (lessonId: number, data: UpdateLessonRequest) =>
        put<Lesson>(`/api/v1/lessons/${lessonId}`, data),

    delete: (lessonId: number) =>
        del<void>(`/api/v1/lessons/${lessonId}`),

    togglePublish: (lessonId: number) =>
        patch<void>(`/api/v1/lessons/${lessonId}/publish`),
};
