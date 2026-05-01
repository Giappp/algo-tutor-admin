"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {CreateTestCaseRequest, UpdateTestCaseRequest,} from "@/types/learning-path";
import {testCaseService} from "@/api/services/testcase-services";

export const QUERY_KEYS = {
    testCases: (lessonId: number) => ["test-cases", lessonId] as const,
    testCase: (id: number) => ["test-case", id] as const,
};

export function useTestCasesByLesson(lessonId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.testCases(lessonId),
        queryFn: async () => {
            return await testCaseService.listByLesson(lessonId);
        },
        enabled: !!lessonId,
    });
}

export function useCreateTestCase(lessonId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTestCaseRequest) =>
            testCaseService.create(lessonId, data),
        onSuccess: () => {
            toast.success("Test case created successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.testCases(lessonId)});
        },
    });
}

export function useUpdateTestCase(testCaseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateTestCaseRequest) =>
            testCaseService.update(testCaseId, data),
        onSuccess: () => {
            toast.success("Test case updated successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.testCase(testCaseId)});
        },
    });
}

export function useDeleteTestCase() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (testCaseId: number) => testCaseService.delete(testCaseId),
        onSuccess: () => {
            toast.success("Test case deleted successfully");
            queryClient.invalidateQueries({queryKey: ["test-cases"]});
        },
    });
}
