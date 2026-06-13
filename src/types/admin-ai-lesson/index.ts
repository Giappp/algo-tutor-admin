import type {Difficulty, LessonType} from "@/types/learning-path";

export type AiProvider = "OPENAI" | "GEMINI" | "CLAUDE";

interface LessonDraftBase {
    title: string;
    type: LessonType;
    difficulty: Difficulty;
    displayOrder: number | null;
}

export interface TheoryLessonDraft extends LessonDraftBase {
    type: "THEORY";
    content: string;
    estimatedMinutes: number | null;
}

export interface ProblemExampleDraft {
    input: string | null;
    output: string | null;
    explanation: string | null;
    imageUrl: string | null;
}

export interface CodingLessonDraft extends LessonDraftBase {
    type: "CODING";
    statement: string;
    baseTimeLimitMs: number | null;
    baseMemoryLimitMb: number | null;
    constraints: string[] | null;
    starterCode: Record<string, string> | null;
    examples: ProblemExampleDraft[] | null;
    hints: string[] | null;
}

export interface QuizChoiceDraft {
    id: string | null;
    text: string;
    isCorrect: boolean;
    explanation: string | null;
}

export interface QuizQuestionDraft {
    question: string;
    type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
    points: number | null;
    explanation: string | null;
    orderIndex: number | null;
    choices: QuizChoiceDraft[];
}

export interface QuizLessonDraft extends LessonDraftBase {
    type: "QUIZ";
    passingScore: number | null;
    timeLimitMinutes: number | null;
    questions: QuizQuestionDraft[] | null;
}

export type LessonDraft = TheoryLessonDraft | CodingLessonDraft | QuizLessonDraft;

export interface GenerateLessonContentRequest {
    provider?: AiProvider | null;
    prompt: string;
}

export interface GenerateLessonContentResponse {
    lessonId: number;
    lessonType: LessonType;
    content: LessonDraft;
    context: {
        learningPathId: number;
        learningPathName: string;
        topicId: number;
        topicName: string;
        siblingLessons: string[];
    };
    inputTokens: number | null;
    outputTokens: number | null;
}
