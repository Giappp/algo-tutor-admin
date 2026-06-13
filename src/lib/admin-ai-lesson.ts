import type {Lesson} from "@/types/learning-path";
import type {LessonDraft, QuizQuestionDraft} from "@/types/admin-ai-lesson";
import type {QuestionRequestDTO} from "@/types/learning-path/schema";

export function mergeLessonDraft(lesson: Lesson, draft: LessonDraft): Lesson {
    if (draft.type === "THEORY") {
        return {
            ...lesson,
            content: draft.content,
            estimatedMinutes: draft.estimatedMinutes ?? undefined,
        };
    }

    if (draft.type === "CODING") {
        return {
            ...lesson,
            statement: draft.statement,
            baseTimeLimitMs: draft.baseTimeLimitMs ?? undefined,
            baseMemoryLimitMb: draft.baseMemoryLimitMb ?? undefined,
            constraints: draft.constraints ?? [],
            starterCode: draft.starterCode ?? {},
            examples: (draft.examples ?? []).map((example) => ({
                input: example.input ?? "",
                output: example.output ?? "",
                explanation: example.explanation ?? undefined,
                imageUrl: example.imageUrl,
            })),
            hints: draft.hints ?? [],
        };
    }

    return {
        ...lesson,
        passingScore: draft.passingScore ?? undefined,
        timeLimitMinutes: draft.timeLimitMinutes ?? undefined,
    };
}

export function toQuestionRequest(question: QuizQuestionDraft): QuestionRequestDTO {
    return {
        question: question.question,
        type: question.type,
        points: question.points ?? 1,
        explanation: question.explanation ?? undefined,
        orderIndex: question.orderIndex ?? undefined,
        choices: question.choices.map((choice) => ({
            text: choice.text,
            isCorrect: choice.isCorrect,
            explanation: choice.explanation ?? undefined,
        })),
    };
}
