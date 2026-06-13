"use client";

import {useMutation, useQuery} from "@tanstack/react-query";

import {adminAiQuestionService} from "@/api/services/admin-ai-question-services";
import type {GenerateQuestionsFromSourcesRequest} from "@/types/admin-ai-question";

export function useAiQuestionSources(quizLessonId: number, enabled: boolean) {
    return useQuery({
        queryKey: ["admin-ai-question-sources", quizLessonId],
        queryFn: () => adminAiQuestionService.listSources(quizLessonId),
        enabled: enabled && Boolean(quizLessonId),
    });
}

export function useGenerateQuestionsFromSources(quizLessonId: number) {
    return useMutation({
        mutationFn: (data: GenerateQuestionsFromSourcesRequest) =>
            adminAiQuestionService.generateFromSources(quizLessonId, data),
    });
}
