import {del, get, post, put} from "@/api/core/http";
import {TestCase, PresignedUrlRequest, PresignedUrlFileResponse, CreateTestCaseRequest, UpdateTestCaseRequest} from "@/types/learning-path";

export const testCaseService = {
    listByLesson: (lessonId: number): Promise<TestCase[]> =>
        get<TestCase[]>(`/api/v1/testcases/lessons/${lessonId}`),

    create: (lessonId: number, data: CreateTestCaseRequest) =>
        post<TestCase>(`/api/v1/testcases/lessons/${lessonId}`, data),

    update: (testCaseId: number, data: UpdateTestCaseRequest) =>
        put<TestCase>(`/api/v1/testcases/${testCaseId}`, data),

    delete: (testCaseId: number) =>
        del<void>(`/api/v1/testcases/${testCaseId}`),

    getPresignedUrls: (lessonId: number, data: PresignedUrlRequest): Promise<PresignedUrlFileResponse[]> =>
        post<PresignedUrlFileResponse[]>(`/api/v1/lessons/${lessonId}/testcases/presigned-url`, data),
};
