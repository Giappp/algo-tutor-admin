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
    Area,
    Tooltip
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
                fill = "oklch(0.65 0.2 290)"; // Indigo/Purple
                break;
            case "EXPLAIN":
            case "EXPLANATION":
                label = t("explain");
                fill = "oklch(0.55 0.22 272)"; // Royal Violet
                break;
            case "DEBUG":
                label = t("debug");
                fill = "oklch(0.65 0.15 25)"; // Orange/Amber
                break;
            case "REVIEW":
                label = t("review");
                fill = "oklch(0.6 0.15 145)"; // Emerald
                break;
            case "COMPLEXITY":
                label = t("complexity");
                fill = "oklch(0.65 0.14 200)"; // Teal/Cyan
                break;
            case "SOLUTION":
                label = t("solution");
                fill = "oklch(0.5 0.2 350)"; // Pink/Rose
                break;
            case "NEXT_STEP":
                label = t("nextStep");
                fill = "oklch(0.55 0.22 27)"; // Crimson Red
                break;
            case "CHAT":
                label = t("chat");
                fill = "oklch(0.6 0.18 260)"; // Blueish Indigo
                break;
            case "ROADMAP_ADVISORY":
                label = t("roadmapAdvisory");
                fill = "oklch(0.7 0.18 290)"; // Soft Violet
                break;
            default:
                // Format other modes nicely
                label = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase().replace(/_/g, " ");
                fill = "var(--muted-foreground)";
        }

        return {
            id: name,
            name: label,
            value,
            fill
        };
    });

    // Custom Glassmorphism Tooltip for Token Charts
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="backdrop-blur-md bg-background/80 dark:bg-card/85 border border-border/40 px-3.5 py-2.5 rounded-xl shadow-lg flex flex-col gap-1.5 text-[11px] font-sans">
                    <span className="font-semibold text-foreground">{payload[0].payload.date || payload[0].name}</span>
                    <div className="flex flex-col gap-0.5 mt-1 font-mono text-[10px]">
                        {payload.map((p: any) => (
                            <span key={p.name} className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color || p.payload.fill }} />
                                {p.name}: <strong className="text-foreground font-extrabold">{p.value.toLocaleString()}</strong>
                            </span>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-6 fadeInUp">
            {/* Days Filter Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/40 border border-border/30 p-4 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs font-bold text-foreground">{t("aiTokenUsageDesc")}</span>
                </div>
                <div className="inline-flex rounded-xl bg-secondary/80 p-0.5 border border-border/40">
                    {[7, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setAiDays(days)}
                            className={`px-4 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all duration-200 ${
                                aiDays === days
                                    ? "bg-background text-foreground shadow-sm font-extrabold border border-border/20"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t("days", { days })}
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
                    accentColor="chart-1"
                />
                <StatCard
                    title={t("outputTokens")}
                    value={aiTokens.totalOutputTokens.toLocaleString()}
                    icon={ArrowUpCircle}
                    accentColor="emerald"
                />
                <StatCard
                    title={t("totalTokens")}
                    value={aiTokens.totalTokensCombined.toLocaleString()}
                    icon={Cpu}
                    accentColor="chart-5"
                />
            </div>

            {/* Daily History Line Chart */}
            <Card className="rounded-2xl border border-border/40 shadow-sm relative overflow-hidden bg-gradient-to-b from-card to-card/95">
                <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col gap-0.5">
                            <CardTitle className="text-base font-heading font-bold">{t("dailyTokenUsage")}</CardTitle>
                            <CardDescription className="text-xs">{t("dailyTokenUsageDesc")}</CardDescription>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-muted-foreground">{t("input")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-muted-foreground">{t("output")}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-64 w-full pt-0">
                    <ChartContainer config={{}} className="h-64 w-full">
                        <AreaChart data={aiTokens.dailyUsage} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="oklch(var(--primary))" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="oklch(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="oklch(0.62 0.17 145)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="oklch(0.62 0.17 145)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
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
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="inputTokens"
                                stroke="oklch(var(--primary))"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorInput)"
                                name={t("input")}
                            />
                            <Area
                                type="monotone"
                                dataKey="outputTokens"
                                stroke="oklch(0.62 0.17 145)"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorOutput)"
                                name={t("output")}
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Split layout: Usage by mode & Top Consumers */}
            <div className="grid gap-5 lg:grid-cols-5">
                {/* Mode Breakdown */}
                <Card className="lg:col-span-2 rounded-2xl border border-border/40 shadow-sm relative overflow-hidden flex flex-col justify-between bg-gradient-to-b from-card to-card/95">
                    <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-heading font-bold">{t("tokenUsageByMode")}</CardTitle>
                        <CardDescription className="text-xs">{t("tokenUsageByModeDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 pt-2">
                        <div className="flex justify-center h-36 w-full relative">
                            <ChartContainer config={{}} className="h-36 w-36">
                                <PieChart>
                                    <Pie
                                        data={aiUsageModeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        dataKey="value"
                                        nameKey="name"
                                        paddingAngle={3}
                                    >
                                        {aiUsageModeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-90 hover:scale-[1.02] origin-center transition-all duration-300 cursor-pointer" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ChartContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">Tokens</span>
                                <span className="text-sm font-heading font-extrabold text-foreground mt-0.5">
                                    {aiTokens.totalTokensCombined.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            {aiUsageModeData.map((item) => {
                                const total = aiUsageModeData.reduce((acc, curr) => acc + curr.value, 0);
                                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                                return (
                                    <div key={item.id} className="flex items-center justify-between text-xs border-t border-border/20 pt-2 first:border-0 first:pt-0 group cursor-default">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: item.fill }} />
                                            <span className="font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{item.name}</span>
                                        </div>
                                        <span className="font-mono text-muted-foreground font-bold group-hover:text-foreground transition-colors">
                                            {item.value.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">({percentage}%)</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Consumers Table */}
                <Card className="lg:col-span-3 rounded-2xl border border-border/40 shadow-sm relative overflow-hidden bg-gradient-to-b from-card to-card/95">
                    <div className="absolute inset-0 noise-overlay opacity-[0.015] pointer-events-none" />
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-heading font-bold">{t("topConsumers")}</CardTitle>
                        <CardDescription className="text-xs">{t("topConsumersDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="border border-border/30 rounded-xl overflow-hidden bg-card/50 backdrop-blur-md">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-b border-border/30">
                                        <TableHead className="w-16 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{t("rank")}</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3">{t("user")}</TableHead>
                                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 py-3">{t("totalConsumption")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {aiTokens.topConsumers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-32 text-center text-xs text-muted-foreground">
                                                {t("noResults")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        aiTokens.topConsumers.map((user, idx) => {
                                            const maxCombined = Math.max(...aiTokens.topConsumers.map(u => u.totalTokens), 1);
                                            const pctRatio = ((user.totalTokens / maxCombined) * 100).toFixed(0);
                                            return (
                                                <TableRow key={user.userId} className="group hover:bg-muted/30 border-b border-border/20 last:border-0 transition-colors duration-150">
                                                    <TableCell className="text-center font-extrabold text-xs">
                                                        {idx === 0 ? (
                                                            <span className="inline-flex size-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">1</span>
                                                        ) : idx === 1 ? (
                                                            <span className="inline-flex size-6 items-center justify-center rounded-lg bg-slate-400/10 text-slate-500 border border-slate-400/20 shadow-sm">2</span>
                                                        ) : idx === 2 ? (
                                                            <span className="inline-flex size-6 items-center justify-center rounded-lg bg-orange-400/10 text-orange-500 border border-orange-400/20 shadow-sm">3</span>
                                                        ) : (
                                                            <span className="text-muted-foreground font-mono">{idx + 1}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="w-8 h-8 border border-border/50 shadow-inner">
                                                                <AvatarFallback className="text-[10px] font-extrabold bg-muted text-muted-foreground uppercase">
                                                                    {user.username.slice(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">{user.username}</span>
                                                                <span className="text-[10px] text-muted-foreground truncate max-w-[160px] font-sans mt-0.5">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right py-3">
                                                        <div className="flex flex-col gap-1 items-end">
                                                            <span className="font-mono text-xs font-extrabold text-foreground">{user.totalTokens.toLocaleString()} tokens</span>
                                                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/80">
                                                                <span>In: <strong className="font-mono text-foreground/80">{user.inputTokens.toLocaleString()}</strong></span>
                                                                <span>•</span>
                                                                <span>Out: <strong className="font-mono text-foreground/80">{user.outputTokens.toLocaleString()}</strong></span>
                                                            </div>
                                                            <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden mt-1">
                                                                <div className="bg-primary h-full rounded-full transition-all duration-500 group-hover:brightness-105" style={{ width: `${pctRatio}%` }} />
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
