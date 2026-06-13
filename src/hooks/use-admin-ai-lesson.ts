"use client";

import {useMutation} from "@tanstack/react-query";
import {adminAiLessonService} from "@/api/services/admin-ai-lesson-services";
import type {GenerateLessonContentRequest} from "@/types/admin-ai-lesson";
import type {LessonType} from "@/types/learning-path";

export function useGenerateLessonContent(lessonId: number, lessonType: LessonType) {
    return useMutation({
        mutationFn: (data: GenerateLessonContentRequest) =>
            adminAiLessonService.generateContent(lessonId, lessonType, data),
    });
}
