"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {CreateQuestionDTO} from "@/types/learning-path/schema";
import {quizService} from "@/api/services/quiz-services";

export const QUERY_KEYS = {
    questions: (lessonId: number) => ["questions", lessonId] as const,
    question: (id: number) => ["question", id] as const,
};

export function useQuestionsByLesson(lessonId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.questions(lessonId),
        queryFn: () => quizService.listByLesson(lessonId),
        enabled: !!lessonId,
    });
}

export function useCreateQuestion(lessonId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateQuestionDTO) =>
            quizService.create(lessonId, data as Parameters<typeof quizService.create>[1]),
        onSuccess: () => {
            toast.success("Question added successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.questions(lessonId)});
        },
    });
}

export function useUpdateQuestion(questionId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateQuestionDTO) =>
            quizService.update(questionId, data as Parameters<typeof quizService.update>[1]),
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
