import z from "zod";

export const DifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const step1Schema = z.object({
    title: z.string().min(1, "Title is required.").max(200, "Title must be 200 characters or less."),
    slug: z
        .string()
        .min(1, "Slug is required.")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated."),
    statement: z.string().min(10, "Problem statement must be at least 10 characters."),
    difficulty: DifficultyEnum,
    tagIds: z.array(z.number()),
});

export type Step1Data = z.infer<typeof step1Schema>;

const testCaseSchema = z.object({
    input: z.string().min(1, "Input is required."),
    output: z.string().min(1, "Expected output is required."),
    isHidden: z.boolean(),
    scoreWeight: z.number().min(0, "Score weight must be non-negative."),
});

export type TestCase = z.infer<typeof testCaseSchema>;

const solutionsSchema = z.object({
    cpp: z.string(),
    python: z.string(),
    java: z.string(),
});

export type Solutions = z.infer<typeof solutionsSchema>;

export const step2Schema = z
    .object({
        testCases: z.array(testCaseSchema).min(1, "At least one test case is required."),
        solutions: solutionsSchema,
    })
    .refine(
        (data) =>
            data.solutions.cpp.trim().length > 0 ||
            data.solutions.python.trim().length > 0 ||
            data.solutions.java.trim().length > 0,
        {
            message: "At least one solution in any language is required.",
            path: ["solutions"],
        }
    );

export type Step2Data = z.infer<typeof step2Schema>;


export const step3Schema = z.object({
    aiContext: z.string(),
});

export type Step3Data = z.infer<typeof step3Schema>;
