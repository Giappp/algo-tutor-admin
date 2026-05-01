import {del, get, post, put} from "@/api/core/http";
import {CreateTestCaseRequest, TestCase, UpdateTestCaseRequest} from "@/types/learning-path";

export const testCaseService = {
    listByLesson: (lessonId: number): Promise<TestCase[]> =>
        get<TestCase[]>(`/api/v1/testcases/lessons/${lessonId}`),

    create: (lessonId: number, data: CreateTestCaseRequest) =>
        post<TestCase>(`/api/v1/testcases/lessons/${lessonId}`, data),

    update: (testCaseId: number, data: UpdateTestCaseRequest) =>
        put<TestCase>(`/api/v1/testcases/${testCaseId}`, data),

    delete: (testCaseId: number) =>
        del<void>(`/api/v1/testcases/${testCaseId}`),
};
