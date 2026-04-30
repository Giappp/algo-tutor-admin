import {get, post, put, del, getPage} from "@/api/core/http";
import {Editorial, CreateEditorialRequest, UpdateEditorialRequest} from "@/types/learning-path";
import {PaginatedResponse} from "@/api/core/http";

export const editorialService = {
    listByLesson: (lessonId: number): Promise<PaginatedResponse<Editorial>> =>
        getPage<Editorial>(`/api/v1/editorials/lessons/${lessonId}`),

    create: (lessonId: number, data: CreateEditorialRequest) =>
        post<Editorial>(`/api/v1/editorials/lessons/${lessonId}`, data),

    update: (editorialId: number, data: UpdateEditorialRequest) =>
        put<Editorial>(`/api/v1/editorials/${editorialId}`, data),

    delete: (editorialId: number) =>
        del<void>(`/api/v1/editorials/${editorialId}`),
};
