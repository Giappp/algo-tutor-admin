"use client";

import {useMutation, useQuery} from "@tanstack/react-query";
import {adminAiCodingService} from "@/api/services/admin-ai-coding-services";

export function useCodingAiSources(lessonId: number, enabled: boolean) {
    return useQuery({
        queryKey: ["admin-ai-coding-sources", lessonId],
        queryFn: () => adminAiCodingService.listSources(lessonId),
        enabled: enabled && Boolean(lessonId),
    });
}

export function useGenerateCodingProblem(lessonId: number) {
    return useMutation({mutationFn: (data: Parameters<typeof adminAiCodingService.generateProblem>[1]) => adminAiCodingService.generateProblem(lessonId, data)});
}

export function useGenerateCodingEditorial(lessonId: number) {
    return useMutation({mutationFn: (data: Parameters<typeof adminAiCodingService.generateEditorial>[1]) => adminAiCodingService.generateEditorial(lessonId, data)});
}

export function useGenerateStarterCode(lessonId: number) {
    return useMutation({mutationFn: (data: Parameters<typeof adminAiCodingService.generateStarterCode>[1]) => adminAiCodingService.generateStarterCode(lessonId, data)});
}
