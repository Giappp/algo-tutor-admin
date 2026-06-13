"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {useTranslations} from "next-intl";
import {testCaseService} from "@/api/services/testcase-services";
import {CreateTestCaseRequest, UpdateTestCaseRequest} from "@/types/learning-path";

export const QUERY_KEYS = {
    testCases: (lessonId: number) => ["test-cases", lessonId] as const,
    testCase: (id: number) => ["test-case", id] as const,
};

export function useTestCasesByLesson(lessonId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.testCases(lessonId),
        queryFn: () => testCaseService.listByLesson(lessonId),
        enabled: !!lessonId,
    });
}

export function useCreateTestCase(lessonId: number) {
    const queryClient = useQueryClient();
    const t = useTranslations("codingResources.testCases");

    return useMutation({
        mutationFn: (data: CreateTestCaseRequest) =>
            testCaseService.create(lessonId, data),
        onSuccess: () => {
            toast.success(t("toast.created"));
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.testCases(lessonId)});
        },
    });
}

export function useUpdateTestCase(testCaseId: number) {
    const queryClient = useQueryClient();
    const t = useTranslations("codingResources.testCases");

    return useMutation({
        mutationFn: (data: UpdateTestCaseRequest) =>
            testCaseService.update(testCaseId, data),
        onSuccess: () => {
            toast.success(t("toast.updated"));
            queryClient.invalidateQueries({queryKey: ["test-cases"]});
        },
    });
}

export function useDeleteTestCase() {
    const queryClient = useQueryClient();
    const t = useTranslations("codingResources.testCases");

    return useMutation({
        mutationFn: (testCaseId: number) => testCaseService.delete(testCaseId),
        onSuccess: () => {
            toast.success(t("toast.deleted"));
            queryClient.invalidateQueries({queryKey: ["test-cases"]});
        },
    });
}

export function useReorderTestCases(lessonId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            fromId,
            fromOrder,
            toId,
            toOrder,
        }: {
            fromId: number;
            fromOrder: number;
            toId: number;
            toOrder: number;
        }) => {
            await Promise.all([
                testCaseService.update(fromId, {sortOrder: toOrder}),
                testCaseService.update(toId, {sortOrder: fromOrder}),
            ]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.testCases(lessonId)});
        },
    });
}
