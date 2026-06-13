"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
    useDashboardOverview,
    useDashboardAITokens,
    useDashboardAPIQuotas
} from "@/hooks/use-dashboard";
import {
    RefreshCw,
    AlertTriangle,
    LayoutDashboard,
    Sparkles,
    ShieldCheck,
    Radio
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import modular child components
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { AITokensTab } from "@/components/dashboard/ai-tokens-tab";
import { APIQuotasTab } from "@/components/dashboard/api-quotas-tab";

export default function DashboardPage() {
    const t = useTranslations("dashboard");
    const [activeTab, setActiveTab] = useState<"overview" | "ai-tokens" | "api-quotas">("overview");
    const [aiDays, setAiDays] = useState<number>(30);

    // React Query API hooks
    const {
        data: overview,
        isLoading: isLoadingOverview,
        isError: isErrorOverview,
        refetch: refetchOverview
    } = useDashboardOverview(activeTab === "overview");

    const {
        data: aiTokens,
        isLoading: isLoadingAI,
        isError: isErrorAI,
        refetch: refetchAI
    } = useDashboardAITokens(aiDays, activeTab === "ai-tokens");

    const {
        data: apiQuotas,
        isLoading: isLoadingQuotas,
        isError: isErrorQuotas,
        refetch: refetchQuotas
    } = useDashboardAPIQuotas(activeTab === "api-quotas");

    const isTabLoading =
        (activeTab === "overview" && isLoadingOverview) ||
        (activeTab === "ai-tokens" && isLoadingAI) ||
        (activeTab === "api-quotas" && isLoadingQuotas);

    const isTabError =
        (activeTab === "overview" && isErrorOverview) ||
        (activeTab === "ai-tokens" && isErrorAI) ||
        (activeTab === "api-quotas" && isErrorQuotas);

    const handleRetry = () => {
        if (activeTab === "overview") refetchOverview();
        if (activeTab === "ai-tokens") refetchAI();
        if (activeTab === "api-quotas") refetchQuotas();
    };

    return (
        <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
            className="mx-auto flex w-full max-w-7xl flex-col gap-6"
        >
            <header className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                        <Radio className="size-3.5 text-emerald-600" aria-hidden="true" />
                        <span>{t("autoRefreshStatus")}</span>
                    </div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
                        {t("title")}
                    </h1>
                    <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {t("welcome")}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isTabLoading}
                    aria-label={t("refreshData")}
                >
                    <RefreshCw className={isTabLoading ? "animate-spin" : ""} />
                    {t("refreshData")}
                </Button>
            </header>

            <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-1 sm:w-fit">
                <TabsTrigger value="overview" className="h-9 flex-none px-4 text-xs">
                    <LayoutDashboard aria-hidden="true" />
                    {t("systemOverview")}
                </TabsTrigger>
                <TabsTrigger value="ai-tokens" className="h-9 flex-none px-4 text-xs">
                    <Sparkles aria-hidden="true" />
                    {t("aiTokenUsage")}
                </TabsTrigger>
                <TabsTrigger value="api-quotas" className="h-9 flex-none px-4 text-xs">
                    <ShieldCheck aria-hidden="true" />
                    {t("apiQuotas")}
                    {apiQuotas && apiQuotas.length > 0 && (
                        <span className="ml-1 rounded-md bg-foreground px-1.5 py-0.5 font-mono text-[9px] text-background">
                            {apiQuotas.length}
                        </span>
                    )}
                </TabsTrigger>
            </TabsList>

            {isTabError && (
                <Card role="alert" className="overflow-hidden rounded-xl border-destructive/30 bg-destructive/[0.02] shadow-none">
                    <CardContent className="flex flex-col items-center justify-center text-center p-10 gap-4">
                        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-destructive">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col gap-1 max-w-md">
                            <h3 className="text-base font-bold text-foreground">{t("failedToLoad")}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                                {t("loadErrorDescription")}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleRetry}>
                            <RefreshCw className="w-3.5 h-3.5" />
                            {t("retryNow")}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {isTabLoading && !isTabError && (
                <div className="flex flex-col gap-6" aria-busy="true" aria-label={t("loadingData")}>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="p-6 border border-border/40 bg-gradient-to-b from-card to-card/95 relative overflow-hidden rounded-2xl">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col gap-2.5 w-2/3">
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-8 w-2/3 mt-1.5" />
                                        <Skeleton className="h-3 w-3/4 mt-1" />
                                    </div>
                                    <Skeleton className="size-12 rounded-xl" />
                                </div>
                            </Card>
                        ))}
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="col-span-2 p-6 rounded-2xl border border-border/40"><Skeleton className="h-64 w-full" /></Card>
                        <Card className="p-6 rounded-2xl border border-border/40"><Skeleton className="h-64 w-full" /></Card>
                    </div>
                </div>
            )}

            {!isTabLoading && !isTabError && (
                <>
                    <TabsContent value="overview">
                    {overview && (
                        <OverviewTab overview={overview} />
                    )}
                    </TabsContent>
                    <TabsContent value="ai-tokens">
                    {aiTokens && (
                        <AITokensTab
                            aiTokens={aiTokens}
                            aiDays={aiDays}
                            setAiDays={setAiDays}
                        />
                    )}
                    </TabsContent>
                    <TabsContent value="api-quotas">
                    {apiQuotas && (
                        <APIQuotasTab
                            apiQuotas={apiQuotas}
                            refetchQuotas={refetchQuotas}
                        />
                    )}
                    </TabsContent>
                </>
            )}
        </Tabs>
    );
}
