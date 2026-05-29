"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { dashboardService } from "@/api/services/dashboard-services";

export function useDashboardOverview() {
    return useQuery({
        queryKey: queryKeys.dashboard.overview(),
        queryFn: () => dashboardService.getOverview(),
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}

export function useDashboardAITokens(days?: number) {
    return useQuery({
        queryKey: queryKeys.dashboard.aiTokens(days),
        queryFn: () => dashboardService.getAITokens(days),
        refetchInterval: 60000, // Refetch every 60 seconds
    });
}

export function useDashboardAPIQuotas() {
    return useQuery({
        queryKey: queryKeys.dashboard.apiQuotas(),
        queryFn: () => dashboardService.getAPIQuotas(),
        refetchInterval: 10000, // Refetch every 10 seconds for real-time tracking
    });
}
