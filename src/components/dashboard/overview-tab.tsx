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
    Pie
} from "recharts";

interface OverviewTabProps {
    overview: SystemOverview;
}

export function OverviewTab({ overview }: OverviewTabProps) {
    const t = useTranslations("dashboard");

    // Formatted data helper for chart rendering
    const verdictData = Object.entries(overview.verdictDistribution).map(([name, value]) => ({
        name,
        value,
        fill: name === "ACCEPTED" ? "var(--chart-2)" :
               name === "WRONG_ANSWER" ? "var(--destructive)" :
               name === "TIME_LIMIT_EXCEEDED" ? "var(--chart-4)" :
               name === "COMPILATION_ERROR" ? "var(--chart-1)" :
               "var(--chart-5)"
    }));

    const lessonData = Object.entries(overview.lessonDistribution).map(([name, value]) => ({
        name,
        value,
        fill: name === "CODING" ? "#10b981" :
               name === "THEORY" ? "#3b82f6" :
               "#f59e0b"
    }));

    return (
        <div className="flex flex-col gap-6 fadeInUp">
            {/* Grid 6 Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title={t("totalUsers")}
                    value={overview.totalUsers.toLocaleString()}
                    icon={Users}
                    accentClass="bg-chart-1/10 text-chart-1 border-chart-1/20 dark:bg-chart-1/20 dark:text-chart-1"
                    gradientFrom="from-chart-1 to-chart-1/30"
                    description="Người dùng đăng ký hợp lệ"
                />
                <StatCard
                    title={t("activeSessions")}
                    value={overview.activeSessions.toLocaleString()}
                    icon={Activity}
                    accentClass="bg-chart-3/10 text-chart-3 border-chart-3/20 dark:bg-chart-3/20 dark:text-chart-3"
                    gradientFrom="from-chart-3 to-chart-3/30"
                    description="Đang trực tuyến hiện tại"
                />
                <StatCard
                    title={t("totalLessons")}
                    value={overview.totalLessons.toLocaleString()}
                    icon={BookOpen}
                    accentClass="bg-chart-2/10 text-chart-2 border-chart-2/20 dark:bg-chart-2/20 dark:text-chart-2"
                    gradientFrom="from-chart-2 to-chart-2/30"
                    description="Tổng lý thuyết & thực hành"
                />
                <StatCard
                    title={t("totalEnrollments")}
                    value={overview.totalEnrollments.toLocaleString()}
                    icon={GraduationCap}
                    accentClass="bg-chart-4/10 text-chart-4 border-chart-4/20 dark:bg-chart-4/20 dark:text-chart-4"
                    gradientFrom="from-chart-4 to-chart-4/30"
                    description="Lượt tham gia học lộ trình"
                />
                <StatCard
                    title={t("totalSubmissions")}
                    value={overview.totalSubmissions.toLocaleString()}
                    icon={Code2}
                    accentClass="bg-chart-5/10 text-chart-5 border-chart-5/20 dark:bg-chart-5/20 dark:text-chart-5"
                    gradientFrom="from-chart-5 to-chart-5/30"
                    description="Nộp bài lập trình chấm tự động"
                />
                <StatCard
                    title={t("totalQuizAttempts")}
                    value={overview.totalQuizAttempts.toLocaleString()}
                    icon={HelpCircle}
                    accentClass="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
                    gradientFrom="from-emerald-500 to-emerald-500/30"
                    description="Lượt hoàn thành trắc nghiệm"
                />
            </div>

            {/* Overview Charts */}
            <div className="grid gap-5 lg:grid-cols-3">
                {/* Verdict Distribution */}
                <Card className="lg:col-span-2 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
                    <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-heading font-bold">{t("verdictDistribution")}</CardTitle>
                        <CardDescription className="text-xs">{t("verdictDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-5 gap-6 items-center pt-2">
                        <div className="md:col-span-2 flex justify-center">
                            <div className="h-44 w-44">
                                <ChartContainer config={{}} className="h-44 w-44">
                                    <PieChart>
                                        <Pie
                                            data={verdictData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={70}
                                            dataKey="value"
                                            nameKey="name"
                                            labelLine={false}
                                            paddingAngle={3}
                                        >
                                            {verdictData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-85 transition-opacity" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                            </div>
                        </div>
                        <div className="md:col-span-3 flex flex-col gap-3">
                            {verdictData.map((item) => {
                                const total = verdictData.reduce((acc, curr) => acc + curr.value, 0);
                                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                                return (
                                    <div key={item.name} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.fill }} />
                                                <span className="font-semibold text-foreground/90 font-sans">{item.name}</span>
                                            </div>
                                            <span className="font-mono text-muted-foreground">{item.value.toLocaleString()} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: item.fill, width: `${percentage}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Lesson Distribution */}
                <Card className="rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 noise-overlay opacity-[0.015] pointer-events-none" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-heading font-bold">{t("lessonTypeDistribution")}</CardTitle>
                        <CardDescription className="text-xs">{t("lessonTypeDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col pt-2 h-full justify-between gap-6">
                        <div className="h-36 w-full">
                            <ChartContainer config={{}} className="h-36 w-full">
                                <BarChart data={lessonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-zinc-100 dark:stroke-zinc-800" />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {lessonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                            {lessonData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-xs border-t border-border/30 pt-2 first:border-0 first:pt-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                        <span className="font-semibold text-foreground/95">{item.name}</span>
                                    </div>
                                    <span className="font-mono font-bold text-foreground">{item.value} bài học</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
