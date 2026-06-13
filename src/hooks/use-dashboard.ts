"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { dashboardService } from "@/api/services/dashboard-services";

export function useDashboardOverview(enabled = true) {
    return useQuery({
        queryKey: queryKeys.dashboard.overview(),
        queryFn: () => dashboardService.getOverview(),
        enabled,
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}

export function useDashboardAITokens(days?: number, enabled = true) {
    return useQuery({
        queryKey: queryKeys.dashboard.aiTokens(days),
        queryFn: () => dashboardService.getAITokens(days),
        enabled,
        refetchInterval: 60000, // Refetch every 60 seconds
    });
}

export function useDashboardAPIQuotas(enabled = true) {
    return useQuery({
        queryKey: queryKeys.dashboard.apiQuotas(),
        queryFn: () => dashboardService.getAPIQuotas(),
        enabled,
        refetchInterval: 10000, // Refetch every 10 seconds for real-time tracking
    });
}
