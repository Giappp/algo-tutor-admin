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
    ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
    } = useDashboardOverview();

    const {
        data: aiTokens,
        isLoading: isLoadingAI,
        isError: isErrorAI,
        refetch: refetchAI
    } = useDashboardAITokens(aiDays);

    const {
        data: apiQuotas,
        isLoading: isLoadingQuotas,
        isError: isErrorQuotas,
        refetch: refetchQuotas
    } = useDashboardAPIQuotas();

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
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto stagger-children">
            {/* Ambient Background Radial Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,oklch(0.55_0.22_272/0.05)_0%,transparent_70%)] pointer-events-none -z-10 animate-gradient-shift" />
            <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,oklch(0.65_0.2_290/0.04)_0%,transparent_70%)] pointer-events-none -z-10" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-3xl font-heading font-extrabold text-gradient tracking-tight select-none">
                        {t("title")}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {t("welcome")}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handleRetry}
                        disabled={isTabLoading}
                        className="inline-flex items-center justify-center p-2.5 size-10 rounded-xl border border-border/50 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                        title="Tải lại dữ liệu"
                    >
                        <RefreshCw className={`w-4 h-4 transition-transform duration-700 ${isTabLoading ? "animate-spin text-primary" : "hover:rotate-180"}`} />
                    </button>
                </div>
            </div>

            {/* Custom Premium Tab Bar */}
            <div className="inline-flex items-center gap-1.5 rounded-2xl bg-muted/50 p-1 w-full md:w-fit border border-border/30 backdrop-blur-md">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${activeTab === "overview"
                        ? "bg-background text-foreground shadow-sm font-extrabold border border-border/40"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        }`}
                >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    {t("systemOverview")}
                </button>
                <button
                    onClick={() => setActiveTab("ai-tokens")}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${activeTab === "ai-tokens"
                        ? "bg-background text-foreground shadow-sm font-extrabold border border-border/40"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        }`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("aiTokenUsage")}
                </button>
                <button
                    onClick={() => setActiveTab("api-quotas")}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${activeTab === "api-quotas"
                        ? "bg-background text-foreground shadow-sm font-extrabold border border-border/40"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        }`}
                >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t("apiQuotas")}
                    {apiQuotas && apiQuotas.length > 0 && (
                        <span className="flex size-2 rounded-full bg-destructive animate-pulse ml-0.5" />
                    )}
                </button>
            </div>

            {/* ERROR STATE */}
            {isTabError && (
                <Card className="border-destructive/30 bg-destructive/[0.02] overflow-hidden rounded-2xl shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center text-center p-10 gap-4">
                        <div className="p-3.5 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 shadow-sm animate-bounce">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col gap-1 max-w-md">
                            <h3 className="text-base font-bold text-foreground">{t("failedToLoad")}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                                {t("apiQuotasDesc") ? "An error occurred while connecting to the API server. Please check the backend service status or try again." : "Đã xảy ra lỗi khi kết nối với máy chủ API. Vui lòng kiểm tra trạng thái hoạt động của Backend hoặc thử lại."}
                            </p>
                        </div>
                        <button
                            onClick={handleRetry}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl border bg-background hover:bg-muted transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            {t("retryNow")}
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* SKELETON LOADER */}
            {isTabLoading && !isTabError && (
                <div className="flex flex-col gap-6">
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

            {/* RENDER MODULARIZED CONTENT */}
            {!isTabLoading && !isTabError && (
                <div className="flex flex-col gap-6">
                    {activeTab === "overview" && overview && (
                        <OverviewTab overview={overview} />
                    )}
                    {activeTab === "ai-tokens" && aiTokens && (
                        <AITokensTab
                            aiTokens={aiTokens}
                            aiDays={aiDays}
                            setAiDays={setAiDays}
                        />
                    )}
                    {activeTab === "api-quotas" && apiQuotas && (
                        <APIQuotasTab
                            apiQuotas={apiQuotas}
                            refetchQuotas={refetchQuotas}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
