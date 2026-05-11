import z from "zod";
import {QuestionType} from "@/types/learning-path";

// ---------------------------------------------------------------------------
// Level & Difficulty enums
// ---------------------------------------------------------------------------
export const LevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
export const DifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);
export const QuestionTypeSchema = z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]);
export const ProgrammingLanguageSchema = z.enum(["JAVA", "PYTHON"]);

export const LessonChoiceSchema = z.object({
    text: z.string().min(1, "Choice text is required"),
    isCorrect: z.boolean(),
    explanation: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Learning Path schemas
// ---------------------------------------------------------------------------
export const CreateLearningPathSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    goal: z.string().min(1, "Goal is required"),
    thumbnailUrl: z.string().optional(),
    level: LevelSchema,
});

export const UpdateLearningPathSchema = CreateLearningPathSchema.and(
    z.object({
        id: z.number().int(),
    })
)

// ---------------------------------------------------------------------------
// Topic schemas
// ---------------------------------------------------------------------------
export const CreateTopicSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    scopeTags: z.string().optional(),
    isLocked: z.boolean().optional(),
});

export const UpdateTopicSchema = CreateTopicSchema.and(
    z.object({
        id: z.number().int(),
    })
);

// ---------------------------------------------------------------------------
// Example schema (for coding lessons)
// ---------------------------------------------------------------------------
export const LessonExampleSchema = z.object({
    input: z.string().min(1),
    output: z.string().min(1),
    explanation: z.string().optional(),
});

export const CreateTestCaseSchema = z.object({
    stdin: z.string().min(1, "Standard input is required"),
    expectedStdout: z.string().min(1, "Expected output is required"),
    isHidden: z.boolean().optional(),
    orderIndex: z.number().int().optional(),
    explanation: z.string().optional(),
});

export const UpdateTestCaseSchema = CreateTestCaseSchema.and(
    z.object({
        id: z.number().int(),
    })
);

// ---------------------------------------------------------------------------
// Question schema (used by Quiz lessons)
// ---------------------------------------------------------------------------
export const CreateQuestionSchema = z.object({
    question: z.string().min(1, "Question text is required"),
    type: QuestionTypeSchema,
    points: z.number().int().min(1).optional(),
    explanation: z.string().optional(),
    choices: z
        .array(LessonChoiceSchema)
        .min(2, "At least 2 choices are required"),
});

export const UpdateQuestionSchema = CreateQuestionSchema.and(
    z.object({
        id: z.number().int(),
    })
);

// ---------------------------------------------------------------------------
// Plain (non-Zod) input type used for local card/form state that mirrors
// CreateQuestion — avoids the overhead of Zod-instantiated objects while
// keeping the shape identical to the schema.
// ---------------------------------------------------------------------------
export type QuestionChoiceInput = {
    text: string;
    isCorrect: boolean;
    explanation?: string;
};

export type QuestionInput = {
    question: string;
    type: QuestionType;
    orderIndex?: number;
    points: number;
    explanation?: string;
    choices: QuestionChoiceInput[];
};

// ---------------------------------------------------------------------------
// Base lesson fields (shared across all types)
// ---------------------------------------------------------------------------
const BaseLessonFields = {
    title: z.string().min(1, "Title is required"),
    difficulty: DifficultySchema,
    orderIndex: z.number().int().optional(),
};

// Theory-specific fields
const TheoryLessonFields = {
    content: z.string().optional(),
};

// Quiz-specific fields
const QuizLessonFields = {
    passingScore: z.number().int().min(0).max(100).optional(),
    timeLimitMinutes: z.number().int().optional(),
    questions: z.array(CreateQuestionSchema).optional(),
};

// Coding-specific fields
const CodingLessonFields = {
    statement: z.string().min(1, "Statement is required"),
    baseTimeLimitMs: z.number().int().min(1).max(300000).optional(),
    baseMemoryLimitMb: z.number().int().min(1).max(1024).optional(),
    starterCode: z.record(z.string(), z.string()).optional(),
    constraints: z.array(z.string()).max(10).optional(),
    hints: z.array(z.string()).max(10).optional(),
    examples: z.array(LessonExampleSchema).max(5).optional(),
    testCases: z.array(CreateTestCaseSchema).optional(),
};

// ---------------------------------------------------------------------------
// Polymorphic lesson schema — discriminated union via `type`
// ---------------------------------------------------------------------------
export const CreateTheoryLessonSchema = z.object({
    type: z.literal("THEORY"),
    ...BaseLessonFields,
    ...TheoryLessonFields,
});

export const CreateQuizLessonSchema = z.object({
    type: z.literal("QUIZ"),
    ...BaseLessonFields,
    ...QuizLessonFields,
});

export const CreateCodingLessonSchema = z.object({
    type: z.literal("CODING"),
    ...BaseLessonFields,
    ...CodingLessonFields,
});

export const CreateLessonSchema = z.discriminatedUnion("type", [
    CreateTheoryLessonSchema,
    CreateQuizLessonSchema,
    CreateCodingLessonSchema,
]);

export const UpdateLessonSchema = CreateLessonSchema.and(
    z.object({
        id: z.number().int(),
    })
);

export const CreateEditorialSchema = z.object({
    language: ProgrammingLanguageSchema,
    sourceCode: z.string().min(1, "Source code is required"),
});

export const UpdateEditorialSchema = CreateEditorialSchema.and(
    z.object({
        id: z.number().int(),
    })
);

// ---------------------------------------------------------------------------
// Type inference
// ---------------------------------------------------------------------------
export type CreateLearningPathDTO = z.infer<typeof CreateLearningPathSchema>;
export type UpdateLearningPathDTO = z.infer<typeof UpdateLearningPathSchema>;
export type CreateTopicDTO = z.infer<typeof CreateTopicSchema>;
export type UpdateTopicDTO = z.infer<typeof UpdateTopicSchema>;
export type CreateLessonDTO = z.infer<typeof CreateLessonSchema>;
export type UpdateLessonDTO = z.infer<typeof UpdateLessonSchema>;
export type CreateQuestionDTO = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionDTO = z.infer<typeof UpdateQuestionSchema>;
export type CreateTestCaseDTO = z.infer<typeof CreateTestCaseSchema>;
export type UpdateTestCaseDTO = z.infer<typeof UpdateTestCaseSchema>;
export type CreateEditorialDTO = z.infer<typeof CreateEditorialSchema>;
export type UpdateEditorialDTO = z.infer<typeof UpdateEditorialSchema>;
export type CreateCodingLessonDTO = z.infer<typeof CreateCodingLessonSchema>;
export type CreateQuizLessonDTO = z.infer<typeof CreateQuizLessonSchema>;
export type CreateTheoryLessonDTO = z.infer<typeof CreateTheoryLessonSchema>;
