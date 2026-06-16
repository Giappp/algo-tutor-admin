export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type LessonType = "THEORY" | "QUIZ" | "CODING" | "VIDEO";

export type VideoProcessingStatus = "PENDING_UPLOAD" | "UPLOADING" | "READY" | "FAILED";

export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";

export type ProgrammingLanguage = "JAVA" | "PYTHON" | "CPP";

// ---------------------------------------------------------------------------
// Core Entities
// ---------------------------------------------------------------------------

export interface LessonChoice {
    text: string;
    isCorrect: boolean;
    explanation?: string;
}

export interface QuizQuestion {
    id: number;
    question: string;
    type: QuestionType;
    points: number;
    explanation?: string;
    orderIndex: number;
    choices: LessonChoice[];
    createdAt?: string;
    updatedAt?: string;
}

export interface TestCase {
    id: number;
    inputFileUrl: string;
    outputFileUrl: string;
    inputFileKey: string;
    outputFileKey: string;
    scoreWeight: number;
    isSample: boolean;
    sortOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Editorial {
    id: number;
    language: ProgrammingLanguage;
    sourceCode: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LessonExample {
    input: string;
    output: string;
    explanation?: string;
    imageUrl?: string | null;
}

export interface Lesson {
    id: number;
    title: string;
    slug: string;
    type: LessonType;
    content?: string;
    estimatedMinutes?: number;
    displayOrder: number;
    isPublished: boolean;
    difficulty?: Difficulty;
    description?: string | null;
    // Coding-specific
    statement?: string;
    baseTimeLimitMs?: number;
    baseMemoryLimitMb?: number;
    constraints?: string[];
    starterCode?: Record<string, string>;
    testCases?: TestCase[];
    hints?: string[];
    examples?: LessonExample[];
    keyInsights?: string[];
    // Quiz-specific
    passingScore?: number;
    timeLimitMinutes?: number;
    questions?: QuizQuestion[];
    // Video-specific
    sourceObjectKey?: string | null;
    thumbnailObjectKey?: string | null;
    durationSeconds?: number | null;
    fileSizeBytes?: number | null;
    mimeType?: string | null;
    processingStatus?: VideoProcessingStatus;
    // Editorials
    editorials?: Editorial[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Topic {
    id: number;
    name: string;
    description?: string;
    displayOrder: number;
    isLocked: boolean;
    learningPathId: number;
    lessonCount: number;
    lessons: Lesson[];
    createdAt?: string;
    updatedAt?: string;
}

export interface LearningPath {
    id: number;
    name: string;
    slug: string;
    level: Level;
    description: string;
    goal: string;
    thumbnailUrl?: string;
    isPremium: boolean;
    isPublished: boolean;
    topicCount: number;
    totalLessonCount: number;
    publishedLessonCount: number;
    enrollmentCount: number;
    deleted?: boolean;
    topics: Topic[];
    createdAt?: string;
    updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

export interface CreateLearningPathRequest {
    name: string;
    description: string;
    goal: string;
    isPremium: boolean;
    thumbnailUrl?: string;
    level: Level;
}

export interface UpdateLearningPathRequest {
    name?: string;
    description?: string;
    goal?: string;
    thumbnailUrl?: string;
    level?: Level;
}

export interface CreateTopicRequest {
    name?: string;
    description?: string;
    scopeTags?: string;
    isLocked?: boolean;
}

export interface UpdateTopicRequest {
    name?: string;
    description?: string;
    scopeTags?: string;
    isLocked?: boolean;
}

export interface CreateLessonRequest {
    type: LessonType;
    title: string;
    difficulty?: Difficulty;
    displayOrder?: number;
    // Theory
    content?: string;
    estimatedMinutes?: number;
    // Coding
    statement?: string;
    baseTimeLimitMs?: number;
    baseMemoryLimitMb?: number;
    constraints?: string[];
    starterCode?: Record<string, string>;
    hints?: string[];
    examples?: LessonExample[];
    keyInsights?: string[];
    testCases?: Omit<TestCase, "id" | "createdAt" | "updatedAt">[];
    // Quiz
    passingScore?: number;
    timeLimitMinutes?: number;
    questions?: Omit<QuizQuestion, "id" | "createdAt" | "updatedAt">[];
    // Video
    description?: string;
}

export type UpdateLessonRequest = CreateLessonRequest;

export interface CreateTestCaseRequest {
    inputFileUrl: string;
    outputFileUrl: string;
    inputFileKey: string;
    outputFileKey: string;
    scoreWeight: number;
    isSample: boolean;
    sortOrder: number;
}

export type UpdateTestCaseRequest = Partial<CreateTestCaseRequest>;

// ---------------------------------------------------------------------------
// Presigned URL DTOs
// ---------------------------------------------------------------------------

export type TestCaseFileType = "INPUT" | "OUTPUT";

export interface PresignedUrlFileRequest {
    fileName: string;
    fileType: TestCaseFileType;
}

export interface PresignedUrlRequest {
    files: PresignedUrlFileRequest[];
}

export interface PresignedUrlFileResponse {
    fileName: string;
    fileType: TestCaseFileType;
    uploadUrl: string;
    downloadUrl: string;
    fileKey: string;
}

export interface CreateEditorialRequest {
    language: ProgrammingLanguage;
    sourceCode: string;
}

export type UpdateEditorialRequest = Partial<CreateEditorialRequest>;
