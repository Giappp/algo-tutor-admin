export interface SystemOverview {
    totalUsers: number;
    activeSessions: number;
    totalLessons: number;
    totalEnrollments: number;
    totalSubmissions: number;
    totalQuizAttempts: number;
    verdictDistribution: Record<string, number>;
    lessonDistribution: Record<string, number>;
}

export interface DailyUsage {
    date: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

export interface TopConsumer {
    userId: string;
    username: string;
    email: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

export interface AITokenUsage {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokensCombined: number;
    dailyUsage: DailyUsage[];
    usageByMode: Record<string, number>;
    topConsumers: TopConsumer[];
}

export interface APIQuota {
    key: string;
    action: string;
    userId: string;
    username: string;
    email: string;
    currentRequests: number;
    maxLimit: number;
    windowSeconds: number;
    oldestTimestampMs: number;
}
