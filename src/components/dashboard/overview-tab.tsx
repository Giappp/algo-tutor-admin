"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { SystemOverview } from "@/types/dashboard";
import { StatCard } from "./stat-card";
import {
    Users,
    Activity,
    BookOpen,
    GraduationCap,
    Code2,
    HelpCircle
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    ChartContainer
} from "@/components/ui/chart";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
    PieChart,
    Pie,
    Tooltip
} from "recharts";

interface OverviewTabProps {
    overview: SystemOverview;
}

interface OverviewTooltipEntry {
    name?: string;
    value?: number;
}

function OverviewChartTooltip({
    active,
    payload,
    countLabel,
}: {
    active?: boolean;
    payload?: OverviewTooltipEntry[];
    countLabel: string;
}) {
    if (!active || !payload?.length) return null;

    return (
        <div className="backdrop-blur-md bg-background/80 dark:bg-card/85 border border-border/40 px-3.5 py-2.5 rounded-xl shadow-lg flex flex-col gap-1 text-[11px] font-sans">
            <span className="font-semibold text-foreground">{payload[0].name}</span>
            <span className="font-mono text-muted-foreground mt-0.5">
                {countLabel}: <strong className="text-foreground font-extrabold">{payload[0].value?.toLocaleString()}</strong>
            </span>
        </div>
    );
}

export function OverviewTab({ overview }: OverviewTabProps) {
    const t = useTranslations("dashboard");

    // Format raw verdict values (e.g. WRONG_ANSWER -> Wrong Answer)
    const formatVerdict = (verdict: string) => {
        return verdict
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    // Formatted data helper for chart rendering
    const verdictData = Object.entries(overview.verdictDistribution).map(([name, value]) => ({
        name: formatVerdict(name),
        value,
        fill: name === "ACCEPTED" ? "var(--chart-2)" :
               name === "WRONG_ANSWER" ? "var(--destructive)" :
               name === "TIME_LIMIT_EXCEEDED" ? "var(--chart-4)" :
               name === "COMPILATION_ERROR" ? "var(--chart-1)" :
               "var(--chart-5)"
    }));

    const getLessonLabel = (name: string) => {
        switch (name) {
            case "CODING": return t("coding");
            case "THEORY": return t("theory");
            case "QUIZ": return t("quiz");
            default: return name;
        }
    };

    const lessonData = Object.entries(overview.lessonDistribution).map(([name, value]) => ({
        name: getLessonLabel(name),
        value,
        fill: name === "CODING" ? "oklch(0.6 0.15 145)" :
               name === "THEORY" ? "oklch(0.65 0.18 250)" :
               "oklch(0.7 0.14 70)"
    }));

    const countLabel = t("usage", { defaultValue: "Count" });

    return (
        <div className="flex flex-col gap-6 fadeInUp">
            {/* Grid 6 Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title={t("totalUsers")}
                    value={overview.totalUsers.toLocaleString()}
                    icon={Users}
                    accentColor="chart-1"
                    description={t("totalUsersDesc")}
                />
                <StatCard
                    title={t("activeSessions")}
                    value={overview.activeSessions.toLocaleString()}
                    icon={Activity}
                    accentColor="chart-3"
                    description={t("activeSessionsDesc")}
                />
                <StatCard
                    title={t("totalLessons")}
                    value={overview.totalLessons.toLocaleString()}
                    icon={BookOpen}
                    accentColor="chart-2"
                    description={t("totalLessonsDesc")}
                />
                <StatCard
                    title={t("totalEnrollments")}
                    value={overview.totalEnrollments.toLocaleString()}
                    icon={GraduationCap}
                    accentColor="chart-4"
                    description={t("totalEnrollmentsDesc")}
                />
                <StatCard
                    title={t("totalSubmissions")}
                    value={overview.totalSubmissions.toLocaleString()}
                    icon={Code2}
                    accentColor="chart-5"
                    description={t("totalSubmissionsDesc")}
                />
                <StatCard
                    title={t("totalQuizAttempts")}
                    value={overview.totalQuizAttempts.toLocaleString()}
                    icon={HelpCircle}
                    accentColor="emerald"
                    description={t("totalQuizAttemptsDesc")}
                />
            </div>

            {/* Overview Charts */}
            <div className="grid gap-5 lg:grid-cols-3">
                {/* Verdict Distribution */}
                <Card className="lg:col-span-2 rounded-2xl shadow-sm border border-border/40 relative overflow-hidden bg-gradient-to-b from-card to-card/95">
                    <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
                    <div className="absolute inset-0 dot-pattern opacity-5 pointer-events-none" />
                    
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-heading font-bold">{t("verdictDistribution")}</CardTitle>
                        <CardDescription className="text-xs">{t("verdictDesc")}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="grid md:grid-cols-5 gap-8 items-center pt-4">
                        <div className="md:col-span-2 flex justify-center">
                            <div className="h-44 w-44 relative">
                                <ChartContainer config={{}} className="h-44 w-44">
                                    <PieChart>
                                        <Pie
                                            data={verdictData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={75}
                                            dataKey="value"
                                            nameKey="name"
                                            labelLine={false}
                                            paddingAngle={4}
                                        >
                                            {verdictData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-90 hover:scale-[1.02] origin-center transition-all duration-300 cursor-pointer" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<OverviewChartTooltip countLabel={countLabel} />} />
                                    </PieChart>
                                </ChartContainer>
                                {/* Center total indicator */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Total</span>
                                    <span className="text-xl font-heading font-extrabold text-foreground tracking-tight mt-0.5">
                                        {overview.totalSubmissions.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="md:col-span-3 flex flex-col gap-4">
                            {verdictData.map((item) => {
                                const total = verdictData.reduce((acc, curr) => acc + curr.value, 0);
                                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                                return (
                                    <div key={item.name} className="flex flex-col gap-1.5 group cursor-default">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover:scale-110 shadow-sm" style={{ backgroundColor: item.fill }} />
                                                <span className="font-semibold text-foreground/80 font-sans group-hover:text-foreground transition-colors">{item.name}</span>
                                            </div>
                                            <span className="font-mono text-muted-foreground/90 font-bold group-hover:text-foreground transition-colors">
                                                {item.value.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">({percentage}%)</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted/60 dark:bg-muted/40 rounded-full h-1.5 overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-500 group-hover:brightness-105" style={{ backgroundColor: item.fill, width: `${percentage}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Lesson Distribution */}
                <Card className="rounded-2xl shadow-sm border border-border/40 relative overflow-hidden bg-gradient-to-b from-card to-card/95">
                    <div className="absolute inset-0 noise-overlay opacity-[0.012] pointer-events-none" />
                    
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-heading font-bold">{t("lessonTypeDistribution")}</CardTitle>
                        <CardDescription className="text-xs">{t("lessonTypeDesc")}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col pt-4 h-full justify-between gap-6">
                        <div className="h-40 w-full relative">
                            <ChartContainer config={{}} className="h-40 w-full">
                                <BarChart data={lessonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/40" />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                    />
                                    <Tooltip content={<OverviewChartTooltip countLabel={countLabel} />} cursor={{ fill: "rgba(var(--foreground), 0.02)" }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={32}>
                                        {lessonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-90 hover:brightness-105 transition-all duration-200 cursor-pointer" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </div>
                        
                        <div className="flex flex-col gap-3 mt-2">
                            {lessonData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-xs border-t border-border/30 pt-2.5 first:border-0 first:pt-0 group">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: item.fill }} />
                                        <span className="font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{item.name}</span>
                                    </div>
                                    <span className="font-mono font-extrabold text-foreground group-hover:scale-[1.02] transition-transform">
                                        {t("lessonsCount", { count: item.value })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
