import type {AiProvider} from "@/types/admin-ai-lesson";
import type {AiQuestionSource} from "@/types/admin-ai-question";
import type {Difficulty, LessonExample, ProgrammingLanguage} from "@/types/learning-path";

export type CodingAiAsset = "PROBLEM" | "EDITORIAL" | "STARTER_CODE";

interface GenerateCodingAssetRequestBase {
    sourceLessonIds: number[];
    provider?: AiProvider | null;
    prompt: string;
}

export interface GenerateCodingProblemRequest extends GenerateCodingAssetRequestBase {
    difficulty: Difficulty;
    exampleCount: number;
    hintCount: number;
}

export interface CodingProblemDraft {
    statement: string;
    constraints: string[];
    examples: LessonExample[];
    hints: string[];
}

export interface GenerateCodingEditorialRequest extends GenerateCodingAssetRequestBase {
    language: ProgrammingLanguage;
}

export interface CodingEditorialDraft {
    language: ProgrammingLanguage;
    sourceCode: string;
    approachSummary: string;
    timeComplexity: string;
    spaceComplexity: string;
}

export interface GenerateStarterCodeRequest extends GenerateCodingAssetRequestBase {
    languages: ProgrammingLanguage[];
}

export interface StarterCodeDraft {
    starterCode: Record<string, string>;
    signatureSummary: string;
}

export interface CodingAiResponse<T> {
    lessonId: number;
    content: T;
    context: {
        sources: Array<Pick<AiQuestionSource, "lessonId" | "title" | "topicName">>;
        truncatedSourceIds: number[];
    };
    inputTokens: number | null;
    outputTokens: number | null;
}
