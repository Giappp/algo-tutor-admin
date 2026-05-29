import {get} from "@/api/core/http";
import {AITokenUsage, APIQuota, SystemOverview} from "@/types/dashboard";

export const dashboardService = {
    getOverview: () =>
        get<SystemOverview>("/api/v1/admin/dashboard/overview"),

    getAITokens: (days?: number) =>
        get<AITokenUsage>("/api/v1/admin/dashboard/ai-tokens", {
            params: days !== undefined ? {days} : undefined,
        }),

    getAPIQuotas: () =>
        get<APIQuota[]>("/api/v1/admin/dashboard/api-quotas"),
};
