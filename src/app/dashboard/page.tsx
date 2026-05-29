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
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,oklch(0.55_0.22_272/0.05)_0%,transparent_70%)] pointer-events-none -z-10" />
            <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,oklch(0.65_0.2_290/0.04)_0%,transparent_70%)] pointer-events-none -z-10" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-heading font-bold text-gradient-primary tracking-tight">{t("title")}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{t("welcome")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRetry}
                        className="inline-flex items-center justify-center p-2 size-10 rounded-xl border bg-card hover:bg-muted text-muted-foreground transition-all duration-200"
                        title="Tải lại dữ liệu"
                    >
                        <RefreshCw className="w-4 h-4 hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            {/* Custom Premium Tab Bar */}
            <div className="inline-flex items-center gap-1 rounded-2xl bg-muted/60 p-1 w-full md:w-fit border border-border/40 backdrop-blur-md">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${activeTab === "overview"
                        ? "bg-background text-foreground shadow-sm font-bold border border-border/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    {t("systemOverview")}
                </button>
                <button
                    onClick={() => setActiveTab("ai-tokens")}
                    className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${activeTab === "ai-tokens"
                        ? "bg-background text-foreground shadow-sm font-bold border border-border/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("aiTokenUsage")}
                </button>
                <button
                    onClick={() => setActiveTab("api-quotas")}
                    className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${activeTab === "api-quotas"
                        ? "bg-background text-foreground shadow-sm font-bold border border-border/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t("apiQuotas")}
                    {apiQuotas && apiQuotas.length > 0 && (
                        <span className="flex size-2 rounded-full bg-red-500 animate-pulse ml-0.5" />
                    )}
                </button>
            </div>

            {/* ERROR STATE */}
            {isTabError && (
                <Card className="border-destructive/30 bg-destructive/[0.02] overflow-hidden rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center text-center p-8 gap-4">
                        <div className="p-3 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col gap-1 max-w-md">
                            <h3 className="text-base font-semibold text-foreground">Không thể tải dữ liệu</h3>
                            <p className="text-xs text-muted-foreground">Đã xảy ra lỗi khi kết nối với máy chủ API. Vui lòng kiểm tra trạng thái hoạt động của Backend hoặc thử lại.</p>
                        </div>
                        <button
                            onClick={handleRetry}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border bg-background hover:bg-muted transition-all"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Thử lại ngay
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* SKELETON LOADER */}
            {isTabLoading && !isTabError && (
                <div className="flex flex-col gap-6">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="p-5 border bg-card relative overflow-hidden rounded-2xl">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col gap-2 w-2/3">
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-8 w-2/3 mt-1" />
                                    </div>
                                    <Skeleton className="size-11 rounded-xl" />
                                </div>
                            </Card>
                        ))}
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="col-span-2 p-5 rounded-2xl border"><Skeleton className="h-64 w-full" /></Card>
                        <Card className="p-5 rounded-2xl border"><Skeleton className="h-64 w-full" /></Card>
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
