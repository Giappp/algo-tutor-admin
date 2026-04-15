import z from "zod";

export const DifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const BasicProblemInfoSchema = z.object({
    title: z.string().min(1, "Title is required.").max(200, "Title must be 200 characters or less."),
    slug: z
        .string()
        .min(1, "Slug is required.")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated."),
    statement: z.string().min(10, "Problem statement must be at least 10 characters."),
    difficulty: DifficultyEnum,
    tags: z.array(z.object({ id: z.number(), name: z.string() })),
});

export type BasicInfo = z.infer<typeof BasicProblemInfoSchema>;

const testCaseSchema = z.object({
    input: z.string().min(1, "Input is required."),
    expectedOutput: z.string().min(1, "Expected output is required."),
    isSample: z.boolean(),
    explanation: z.string().optional(),
});

export type TestCase = z.infer<typeof testCaseSchema>;

export const ProgrammingLanguageEnum = z.enum(["CPP", "PYTHON", "JAVA"]);
export type ProgrammingLanguage = z.infer<typeof ProgrammingLanguageEnum>;

export const step2Schema = z.object({
    testCases: z.array(testCaseSchema).min(1, "At least one test case is required."),
    authorSolutionLanguage: ProgrammingLanguageEnum,
    authorSolutionCode: z.string().min(1, "Author solution code is required."),
});

export type Step2Data = z.infer<typeof step2Schema>;


export const step3Schema = z.object({
    algorithmicConcept: z.string().min(1, "Algorithmic concept is required."),
    predefinedHints: z.string().min(1, "Predefined hints are required."),
    edgeCasesToRemind: z.string().min(1, "Edge cases to remind are required."),
});

export type Step3Data = z.infer<typeof step3Schema>;
