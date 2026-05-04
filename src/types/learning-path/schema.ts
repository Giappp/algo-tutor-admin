import z from "zod";

// ---------------------------------------------------------------------------
// Level & Difficulty enums
// ---------------------------------------------------------------------------
export const LevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
export const DifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);
export const LessonTypeSchema = z.enum(["THEORY", "QUIZ", "CODING"]);
export const QuestionTypeSchema = z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]);
export const ProgrammingLanguageSchema = z.enum(["JAVA", "PYTHON"]);

// ---------------------------------------------------------------------------
// Choice schema
// ---------------------------------------------------------------------------
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
    thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    level: LevelSchema,
});

export const UpdateLearningPathSchema = CreateLearningPathSchema.partial();

// ---------------------------------------------------------------------------
// Topic schemas
// ---------------------------------------------------------------------------
export const CreateTopicSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    scopeTags: z.string().optional(),
    isLocked: z.boolean().optional(),
});

export const UpdateTopicSchema = CreateTopicSchema.partial();

// ---------------------------------------------------------------------------
// Example schema (for coding lessons)
// ---------------------------------------------------------------------------
export const LessonExampleSchema = z.object({
    input: z.string().min(1),
    output: z.string().min(1),
    explanation: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Base lesson fields (shared across all types)
// ---------------------------------------------------------------------------
const BaseLessonFields = {
    title: z.string().min(1, "Title is required"),
    difficulty: DifficultySchema.optional(),
    orderIndex: z.number().int().optional(),
};

// Theory-specific fields
const TheoryLessonFields = {
    content: z.string().optional(),
};

// Quiz-specific fields
const QuizLessonFields = {
    content: z.string().optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    timeLimitMinutes: z.number().int().optional(),
};

// Coding-specific fields
const CodingLessonFields = {
    statement: z.string().min(1, "Statement is required"),
    baseTimeLimitMs: z.number().int().min(1).max(300000).optional(),
    baseMemoryLimitMb: z.number().int().min(1).max(1024).optional(),
    constraints: z.array(z.string()).max(10).optional(),
    starterCode: z.record(z.string(), z.string()).optional(),
    hints: z.array(z.string()).max(10).optional(),
    examples: z.array(LessonExampleSchema).max(5).optional(),
    keyInsights: z.array(z.string()).max(20).optional(),
};

// Question schema
export const CreateQuestionSchema = z.object({
    question: z.string().min(1, "Question text is required"),
    type: QuestionTypeSchema.optional(),
    points: z.number().int().min(1).optional(),
    explanation: z.string().optional(),
    choices: z
        .array(LessonChoiceSchema)
        .min(2, "At least 2 choices are required"),
});

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

export const UpdateLessonSchema = CreateLessonSchema;

// ---------------------------------------------------------------------------
// Test case schema
// ---------------------------------------------------------------------------
export const CreateTestCaseSchema = z.object({
    stdin: z.string().min(1, "Standard input is required"),
    expectedStdout: z.string().min(1, "Expected output is required"),
    isHidden: z.boolean().optional(),
    orderIndex: z.number().int().optional(),
    explanation: z.string().optional(),
});

export const UpdateTestCaseSchema = CreateTestCaseSchema;

// ---------------------------------------------------------------------------
// Editorial schema
// ---------------------------------------------------------------------------
export const CreateEditorialSchema = z.object({
    language: ProgrammingLanguageSchema,
    sourceCode: z.string().min(1, "Source code is required"),
});

export const UpdateEditorialSchema = CreateEditorialSchema;

// ---------------------------------------------------------------------------
// Type inference
// ---------------------------------------------------------------------------
export type CreateLearningPath = z.infer<typeof CreateLearningPathSchema>;
export type UpdateLearningPath = z.infer<typeof UpdateLearningPathSchema>;
export type CreateTopic = z.infer<typeof CreateTopicSchema>;
export type UpdateTopic = z.infer<typeof UpdateTopicSchema>;
export type CreateLesson = z.infer<typeof CreateLessonSchema>;
export type UpdateLesson = z.infer<typeof UpdateLessonSchema>;
export type CreateQuestion = z.infer<typeof CreateQuestionSchema>;
export type CreateTestCase = z.infer<typeof CreateTestCaseSchema>;
export type UpdateTestCase = z.infer<typeof UpdateTestCaseSchema>;
export type CreateEditorial = z.infer<typeof CreateEditorialSchema>;
export type UpdateEditorial = z.infer<typeof UpdateEditorialSchema>;
export type CreateCodingLesson = z.infer<typeof CreateCodingLessonSchema>;
export type CreateQuizLesson = z.infer<typeof CreateQuizLessonSchema>;
export type CreateTheoryLesson = z.infer<typeof CreateTheoryLessonSchema>;
