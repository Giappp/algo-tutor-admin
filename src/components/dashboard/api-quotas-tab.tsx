"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { APIQuota } from "@/types/dashboard";
import { RealtimeCountdown } from "./realtime-countdown";
import { ShieldAlert, Info, Activity, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

interface APIQuotasTabProps {
    apiQuotas: APIQuota[];
    refetchQuotas: () => void;
}

export function APIQuotasTab({ apiQuotas, refetchQuotas }: APIQuotasTabProps) {
    const t = useTranslations("dashboard");
    const getRatio = (quota: APIQuota) =>
        quota.maxLimit > 0 ? quota.currentRequests / quota.maxLimit : 0;
    const sortedQuotas = useMemo(
        () => [...apiQuotas].sort((a, b) => {
            const aRatio = a.maxLimit > 0 ? a.currentRequests / a.maxLimit : 0;
            const bRatio = b.maxLimit > 0 ? b.currentRequests / b.maxLimit : 0;
            return bRatio - aRatio;
        }),
        [apiQuotas]
    );
    const warningCount = sortedQuotas.filter((quota) => getRatio(quota) >= 0.8).length;
    const uniqueUsers = new Set(sortedQuotas.map((quota) => quota.userId)).size;

    return (
        <div className="flex flex-col gap-6 fadeInUp">
            <div className="flex items-start gap-4 rounded-xl border border-border/60 bg-muted/30 p-5">
                <div className="shrink-0 rounded-lg border border-primary/20 bg-primary/10 p-2.5 text-primary">
                    <Info className="w-5 h-5 shrink-0" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-heading font-bold text-foreground">{t("apiQuotasTitle")}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {t("apiQuotasSubtitle")}
                    </span>
                </div>
            </div>

            <section className="grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-3" aria-label={t("quotaSummary")}>
                <div className="flex items-center gap-3 bg-card p-4">
                    <Activity className="size-4 text-primary" aria-hidden="true" />
                    <div>
                        <p className="text-2xl font-bold tabular-nums">{sortedQuotas.length}</p>
                        <p className="text-[11px] text-muted-foreground">{t("activeWindows")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-card p-4">
                    <TriangleAlert className="size-4 text-amber-600" aria-hidden="true" />
                    <div>
                        <p className="text-2xl font-bold tabular-nums">{warningCount}</p>
                        <p className="text-[11px] text-muted-foreground">{t("nearLimit")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-card p-4">
                    <ShieldAlert className="size-4 text-emerald-600" aria-hidden="true" />
                    <div>
                        <p className="text-2xl font-bold tabular-nums">{uniqueUsers}</p>
                        <p className="text-[11px] text-muted-foreground">{t("activeUsers")}</p>
                    </div>
                </div>
            </section>

            <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
                <Table className="min-w-[980px]">
                    <TableHeader className="bg-muted/50 border-b border-border/30">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[200px] text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 py-4 pl-6">{t("redisKey")}</TableHead>
                            <TableHead className="w-[100px] text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 py-4">{t("action")}</TableHead>
                            <TableHead className="w-[180px] text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 py-4">{t("user")}</TableHead>
                            <TableHead className="w-[200px] text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 py-4">{t("usage")}</TableHead>
                            <TableHead className="w-[140px] text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 py-4">{t("window")}</TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 py-4 pr-6">{t("resetIn")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {apiQuotas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-xs text-muted-foreground pr-6 pl-6">
                                    <div className="flex flex-col items-center gap-3 py-6">
                                        <div className="p-3 bg-muted/60 dark:bg-muted/40 border border-border/30 text-muted-foreground/80 rounded-2xl shadow-inner animate-pulse">
                                            <ShieldAlert className="w-6 h-6" />
                                        </div>
                                        <span className="font-semibold text-foreground mt-1">{t("noActiveQuotas")}</span>
                                        <span className="text-[11px] text-muted-foreground max-w-md mt-0.5 leading-relaxed">
                                            {t("noActiveQuotasDesc")}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedQuotas.map((quota) => {
                                const ratio = quota.maxLimit > 0 ? (quota.currentRequests / quota.maxLimit) * 100 : 0;
                                const progressValue = Math.min(ratio, 100);
                                const isHigh = ratio >= 80;
                                const isMid = ratio >= 50 && ratio < 80;

                                const quotaProgressColor = isHigh
                                    ? "bg-destructive"
                                    : isMid
                                        ? "bg-amber-500"
                                        : "bg-emerald-500";

                                const badgeColorClass = isHigh
                                    ? "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20"
                                    : isMid
                                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400"
                                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400";

                                return (
                                    <TableRow key={quota.key} className="group hover:bg-muted/30 border-b border-border/20 last:border-0 transition-colors duration-150">
                                        <TableCell className="align-middle font-mono text-[10px] text-muted-foreground select-all break-all max-w-[200px] py-4 pl-6">
                                            {quota.key}
                                        </TableCell>
                                        <TableCell className="align-middle py-4">
                                            <Badge variant="outline" className="text-[9px] uppercase tracking-wide bg-muted font-bold border-border/40 text-foreground py-0.5 px-2">
                                                {quota.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="align-middle py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                                                    {quota.username || t("guest")}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                                    {quota.email || "—"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-middle py-4">
                                            <div className="flex flex-col gap-1.5 w-full pr-4">
                                                <div className="flex items-center justify-between text-[11px] font-semibold">
                                                    <span className="font-mono">{quota.currentRequests} / {quota.maxLimit}</span>
                                                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] border font-bold ${badgeColorClass}`}>
                                                        {ratio.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div
                                                    className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/80"
                                                    role="progressbar"
                                                    aria-label={`${quota.action}: ${ratio.toFixed(0)}%`}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-valuenow={progressValue}
                                                >
                                                    <div className={`h-full rounded-full transition-all duration-500 ${quotaProgressColor}`} style={{ width: `${progressValue}%` }} />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-middle text-xs text-muted-foreground font-semibold py-4">
                                            {t("seconds", { seconds: quota.windowSeconds })}
                                        </TableCell>
                                        <TableCell className="align-middle text-right py-4 pr-6">
                                            <RealtimeCountdown
                                                oldestTimestampMs={quota.oldestTimestampMs}
                                                windowSeconds={quota.windowSeconds}
                                                onExpire={refetchQuotas}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
