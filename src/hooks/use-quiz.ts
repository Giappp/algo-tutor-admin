"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {CreateQuestionRequest} from "@/types/learning-path";
import {quizService} from "@/api/services/quiz-services";

export const QUERY_KEYS = {
    questions: (lessonId: number) => ["questions", lessonId] as const,
    question: (id: number) => ["question", id] as const,
};

export function useQuestionsByLesson(lessonId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.questions(lessonId),
        queryFn: async () => {
            return await quizService.listByLesson(lessonId);
        },
        enabled: !!lessonId,
    });
}

export function useCreateQuestion(lessonId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateQuestionRequest) =>
            quizService.create(lessonId, data),
        onSuccess: () => {
            toast.success("Question added successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.questions(lessonId)});
        },
    });
}

export function useUpdateQuestion(questionId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateQuestionRequest) =>
            quizService.update(questionId, data),
        onSuccess: () => {
            toast.success("Question updated successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.question(questionId)});
        },
    });
}

export function useDeleteQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionId: number) => quizService.delete(questionId),
        onSuccess: () => {
            toast.success("Question deleted successfully");
            queryClient.invalidateQueries({queryKey: ["questions"]});
        },
    });
}
