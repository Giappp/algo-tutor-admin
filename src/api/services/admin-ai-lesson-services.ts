import {post} from "@/api/core/http";
import type {
    GenerateLessonContentRequest,
    GenerateLessonContentResponse,
} from "@/types/admin-ai-lesson";
import type {LessonType} from "@/types/learning-path";

export const adminAiLessonService = {
    generateContent: async (
        lessonId: number,
        lessonType: LessonType,
        data: GenerateLessonContentRequest,
    ) => {
        const response = await post<GenerateLessonContentResponse, GenerateLessonContentRequest>(
            `/api/v1/admin/ai/lessons/${lessonId}/generate-content`,
            {
                provider: data.provider ?? null,
                prompt: data.prompt,
            },
            {timeout: 120_000},
        );

        if (
            response.lessonId !== lessonId
            || response.lessonType !== lessonType
            || response.lessonType !== response.content.type
        ) {
            throw new Error("AI lesson response does not match the requested lesson.");
        }

        return response;
    },
};
