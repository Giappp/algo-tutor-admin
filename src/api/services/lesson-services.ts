import {del, get, getPage, patch, post, put} from "@/api/core/http";
import {CreateLessonRequest, Lesson} from "@/types/learning-path";
import {UpdateLessonDTO} from "@/types/learning-path/schema";

export const lessonService = {
    listByTopic: (topicId: number, publishedOnly = false) =>
        getPage<Lesson>(`/api/v1/lessons/topics/${topicId}`, {
            params: {publishedOnly},
        }),

    getById: (lessonId: number) =>
        get<Lesson>(`/api/v1/lessons/${lessonId}`),

    getBySlug: (slug: string) =>
        get<Lesson>(`/api/v1/lessons/slug/${slug}`),

    create: (topicId: number, data: CreateLessonRequest) =>
        post<Lesson>(`/api/v1/lessons/topics/${topicId}`, data),

    update: (lessonId: number, data: UpdateLessonDTO) =>
        put<UpdateLessonDTO>(`/api/v1/lessons/${lessonId}`, data),

    getPublicById: (lessonId: number) =>
        get<Lesson>(`/api/v1/lessons/public/${lessonId}`),

    getPublicBySlug: (slug: string) =>
        get<Lesson>(`/api/v1/lessons/public/slug/${slug}`),

    delete: (lessonId: number) =>
        del<void>(`/api/v1/lessons/${lessonId}`),

    togglePublish: (lessonId: number) =>
        patch<void>(`/api/v1/lessons/${lessonId}/publish`),
};
