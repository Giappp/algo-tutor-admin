/**
 * Centralized query key factory.
 * All TanStack Query cache keys are defined here to avoid duplication
 * and ensure consistent invalidation across hooks.
 */
export const queryKeys = {
    // ─── Learning Paths ──────────────────────────────────────────────────
    learningPaths: {
        all: ["learning-paths"] as const,
        list: (params?: object) =>
            ["learning-paths", "list", params] as const,
        detail: (id: number) => ["learning-paths", "detail", id] as const,
    },

    // ─── Topics ──────────────────────────────────────────────────────────
    topics: {
        all: ["topics"] as const,
        byLearningPath: (pathId: number) =>
            ["topics", "by-path", pathId] as const,
        detail: (id: number) => ["topics", "detail", id] as const,
    },

    // ─── Lessons ─────────────────────────────────────────────────────────
    lessons: {
        all: ["lessons"] as const,
        byTopic: (topicId: number, publishedOnly?: boolean) =>
            ["lessons", "by-topic", topicId, { publishedOnly }] as const,
        detail: (id: number) => ["lessons", "detail", id] as const,
        bySlug: (slug: string) => ["lessons", "by-slug", slug] as const,
    },

    // ─── Dashboard ───────────────────────────────────────────────────────
    dashboard: {
        all: ["dashboard"] as const,
        overview: () => ["dashboard", "overview"] as const,
        aiTokens: (days?: number) => ["dashboard", "ai-tokens", { days }] as const,
        apiQuotas: () => ["dashboard", "api-quotas"] as const,
    },

    // ─── Admin Users ─────────────────────────────────────────────────────
    adminUsers: {
        all: ["admin-users"] as const,
        list: (params?: object) => ["admin-users", "list", params] as const,
    },
} as const;
