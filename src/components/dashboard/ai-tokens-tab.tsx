"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { AITokenUsage } from "@/types/dashboard";
import { StatCard } from "./stat-card";
import {
    Sparkles,
    ArrowDownCircle,
    ArrowUpCircle,
    Cpu
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    ChartContainer
} from "@/components/ui/chart";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
    PieChart,
    Pie,
    AreaChart,
    Area
} from "recharts";

interface AITokensTabProps {
    aiTokens: AITokenUsage;
    aiDays: number;
    setAiDays: (days: number) => void;
}

export function AITokensTab({ aiTokens, aiDays, setAiDays }: AITokensTabProps) {
    const t = useTranslations("dashboard");

    const aiUsageModeData = Object.entries(aiTokens.usageByMode).map(([name, value]) => {
        let label = name;
        let fill = "var(--muted-foreground)";

        switch (name) {
            case "HINT":
                label = t("hint");
                fill = "var(--chart-3)"; // Blue
                break;
            case "EXPLAIN":
            case "EXPLANATION":
                label = t("explain");
                fill = "var(--chart-1)"; // Purple
                break;
            case "DEBUG":
                label = t("debug");
                fill = "var(--chart-4)"; // Amber/Orange
                break;
            case "REVIEW":
                label = t("review");
                fill = "#10b981"; // Emerald
                break;
            case "COMPLEXITY":
                label = t("complexity");
                fill = "#06b6d4"; // Cyan
                break;
            case "SOLUTION":
                label = t("solution");
                fill = "var(--chart-5)"; // Pink/Magenta
                break;
            case "NEXT_STEP":
                label = t("nextStep");
                fill = "#f43f5e"; // Rose/Red
                break;
            case "CHAT":
                label = t("chat");
                fill = "#6366f1"; // Indigo
                break;
            case "ROADMAP_ADVISORY":
                label = t("roadmapAdvisory");
                fill = "#a855f7"; // Violet
                break;
            default:
                label = name;
                fill = "var(--muted-foreground)";
        }

        return {
            id: name,
            name: label,
            value,
            fill
        };
    });

    return (
        <div className="flex flex-col gap-6 fadeInUp">
            {/* Days Filter & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/30 border border-border/40 p-4 rounded-2xl">
                <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-foreground">{t("dailyTokenUsage")}</span>
                </div>
                <div className="inline-flex rounded-xl bg-muted p-0.5 border">
                    {[7, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setAiDays(days)}
                            className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                                aiDays === days
                                    ? "bg-background text-foreground shadow-sm font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {days} ngày
                        </button>
                    ))}
                </div>
            </div>

            {/* Token Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    title={t("inputTokens")}
                    value={aiTokens.totalInputTokens.toLocaleString()}
                    icon={ArrowDownCircle}
                    accentClass="bg-chart-1/10 text-chart-1 border-chart-1/20 dark:bg-chart-1/20 dark:text-chart-1"
                    gradientFrom="from-chart-1 to-chart-1/30"
                />
                <StatCard
                    title={t("outputTokens")}
                    value={aiTokens.totalOutputTokens.toLocaleString()}
                    icon={ArrowUpCircle}
                    accentClass="bg-chart-3/10 text-chart-3 border-chart-3/20 dark:bg-chart-3/20 dark:text-chart-3"
                    gradientFrom="from-chart-3 to-chart-3/30"
                />
                <StatCard
                    title={t("totalTokens")}
                    value={aiTokens.totalTokensCombined.toLocaleString()}
                    icon={Cpu}
                    accentClass="bg-chart-5/10 text-chart-5 border-chart-5/20 dark:bg-chart-5/20 dark:text-chart-5"
                    gradientFrom="from-chart-5 to-chart-5/30"
                />
            </div>

            {/* Daily History Line Chart */}
            <Card className="rounded-2xl border shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-heading font-bold">{t("dailyTokenUsage")}</CardTitle>
                            <CardDescription className="text-xs">Lượng token vào/ra phục vụ AI trợ giúp theo thời gian</CardDescription>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                <span className="text-muted-foreground">Đầu vào</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="text-muted-foreground">Đầu ra</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-64 w-full pt-0">
                    <ChartContainer config={{}} className="h-64 w-full">
                        <AreaChart data={aiTokens.dailyUsage} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-150 dark:stroke-zinc-800" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="inputTokens"
                                stroke="var(--chart-1)"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorInput)"
                                name="Đầu vào"
                            />
                            <Area
                                type="monotone"
                                dataKey="outputTokens"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorOutput)"
                                name="Đầu ra"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Split layout: Usage by mode & Top Consumers */}
            <div className="grid gap-5 lg:grid-cols-5">
                {/* Mode Breakdown */}
                <Card className="lg:col-span-2 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="text-base font-heading font-bold">{t("tokenUsageByMode")}</CardTitle>
                        <CardDescription className="text-xs">Phân chia lượng token tiêu thụ theo chức năng hệ thống</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 pt-0">
                        <div className="flex justify-center h-36 w-full">
                            <ChartContainer config={{}} className="h-36 w-36">
                                <PieChart>
                                    <Pie
                                        data={aiUsageModeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        dataKey="value"
                                        nameKey="name"
                                        paddingAngle={3}
                                    >
                                        {aiUsageModeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </div>
                        <div className="flex flex-col gap-3">
                            {aiUsageModeData.map((item) => {
                                const total = aiUsageModeData.reduce((acc, curr) => acc + curr.value, 0);
                                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                                return (
                                    <div key={item.id} className="flex items-center justify-between text-xs border-t border-border/30 pt-2 first:border-0 first:pt-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                            <span className="font-semibold text-foreground/90">{item.name}</span>
                                        </div>
                                        <span className="font-mono text-foreground font-bold">{item.value.toLocaleString()} tokens ({percentage}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Consumers Table */}
                <Card className="lg:col-span-3 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="text-base font-heading font-bold">{t("topConsumers")}</CardTitle>
                        <CardDescription className="text-xs">Danh sách tài khoản sử dụng AI nhiều nhất để giám sát lạm dụng</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="border border-border/40 rounded-xl overflow-hidden bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-12 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground/75">Hạng</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground/75">Người dùng</TableHead>
                                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/75">Tổng tiêu thụ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {aiTokens.topConsumers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-28 text-center text-xs text-muted-foreground">
                                                Chưa có dữ liệu tiêu thụ.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        aiTokens.topConsumers.map((user, idx) => {
                                            const maxCombined = Math.max(...aiTokens.topConsumers.map(u => u.totalTokens), 1);
                                            const pctRatio = ((user.totalTokens / maxCombined) * 100).toFixed(0);
                                            return (
                                                <TableRow key={user.userId} className="group hover:bg-muted/40 transition-all duration-150">
                                                    <TableCell className="text-center font-bold text-xs">
                                                        {idx === 0 ? (
                                                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 border border-amber-200 shadow-sm animate-pulse">1</span>
                                                        ) : idx === 1 ? (
                                                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 border border-zinc-300 shadow-sm">2</span>
                                                        ) : idx === 2 ? (
                                                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-orange-100 text-orange-600 border border-orange-200 shadow-sm">3</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">{idx + 1}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2.5">
                                                            <Avatar className="w-8 h-8 border border-border/60">
                                                                <AvatarFallback className="text-[10px] font-bold bg-secondary text-foreground">
                                                                    {user.username.slice(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-xs text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.username}</span>
                                                                <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col gap-1 items-end">
                                                            <span className="font-mono text-xs font-bold text-foreground">{user.totalTokens.toLocaleString()} tokens</span>
                                                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                                                                <span>In: {user.inputTokens.toLocaleString()}</span>
                                                                <span>•</span>
                                                                <span>Out: {user.outputTokens.toLocaleString()}</span>
                                                            </div>
                                                            <div className="w-20 bg-secondary rounded-full h-1 overflow-hidden mt-0.5">
                                                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pctRatio}%` }} />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
