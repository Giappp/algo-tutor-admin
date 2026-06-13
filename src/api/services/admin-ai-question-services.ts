import {get, post} from "@/api/core/http";
import type {
    AiQuestionSource,
    GenerateQuestionsFromSourcesRequest,
    GenerateQuestionsFromSourcesResponse,
} from "@/types/admin-ai-question";

export const adminAiQuestionService = {
    listSources: (quizLessonId: number) =>
        get<AiQuestionSource[]>(`/api/v1/admin/ai/quiz-lessons/${quizLessonId}/question-sources`),

    generateFromSources: (
        quizLessonId: number,
        data: GenerateQuestionsFromSourcesRequest,
    ) => post<GenerateQuestionsFromSourcesResponse, GenerateQuestionsFromSourcesRequest>(
        `/api/v1/admin/ai/quiz-lessons/${quizLessonId}/generate-questions`,
        data,
        {timeout: 120_000},
    ),
};
