import {del, get, post, put} from "@/api/core/http";
import {CreateEditorialRequest, Editorial, UpdateEditorialRequest} from "@/types/learning-path";

export const editorialService = {
    listByLesson: (lessonId: number): Promise<Editorial[]> =>
        get<Editorial[]>(`/api/v1/editorials/lessons/${lessonId}`),

    create: (lessonId: number, data: CreateEditorialRequest) =>
        post<Editorial>(`/api/v1/editorials/lessons/${lessonId}`, data),

    update: (editorialId: number, data: UpdateEditorialRequest) =>
        put<Editorial>(`/api/v1/editorials/${editorialId}`, data),

    delete: (editorialId: number) =>
        del<void>(`/api/v1/editorials/${editorialId}`),
};
