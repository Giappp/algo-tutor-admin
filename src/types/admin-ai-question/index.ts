import type {AiProvider} from "@/types/admin-ai-lesson";
import type {Difficulty, QuestionType} from "@/types/learning-path";
import type {QuestionRequestDTO} from "@/types/learning-path/schema";

export interface AiQuestionSource {
    lessonId: number;
    title: string;
    topicId: number;
    topicName: string;
    displayOrder: number;
    estimatedMinutes: number | null;
    contentCharacterCount: number;
    contentPreview: string;
    isPublished: boolean;
}

export interface GenerateQuestionsFromSourcesRequest {
    sourceLessonIds: number[];
    prompt: string;
    provider?: AiProvider | null;
    difficulty: Difficulty;
    questionTypes: Extract<QuestionType, "SINGLE_CHOICE" | "MULTIPLE_CHOICE">[];
    count: number;
    choicesPerQuestion: number;
    includeExplanations: boolean;
}

export interface GenerateQuestionsFromSourcesResponse {
    quizLessonId: number;
    questions: QuestionRequestDTO[];
    context: {
        sources: Array<Pick<AiQuestionSource, "lessonId" | "title" | "topicName">>;
        truncatedSourceIds: number[];
    };
    inputTokens: number | null;
    outputTokens: number | null;
}
