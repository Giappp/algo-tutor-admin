"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { APIQuota } from "@/types/dashboard";
import { RealtimeCountdown } from "./realtime-countdown";
import { ShieldAlert, Info } from "lucide-react";
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

    return (
        <div className="flex flex-col gap-6 fadeInUp">
            {/* Sliding Window Warning Box */}
            <div className="flex items-start gap-3 p-4 bg-indigo-500/[0.04] border border-indigo-500/20 rounded-2xl">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-foreground">Hệ thống Hạn ngạch API (Sliding Window Limiters)</span>
                    <span className="text-[11px] text-muted-foreground leading-relaxed">
                        Theo dõi in-memory rate-limiter lưu trên Redis. Khi người dùng thực hiện yêu cầu mới, hệ thống tự động chốt sliding window. Bảng hiển thị thông tin các cửa sổ hiện thời kèm bộ đếm ngược tự động làm mới ngay khi thời gian trượt hết hạn.
                    </span>
                </div>
            </div>

            {/* Quotas Monitor Table */}
            <div className="border border-border/40 rounded-2xl overflow-hidden shadow-sm bg-card relative">
                <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[200px] text-xs font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5">Khóa giới hạn (Redis Key)</TableHead>
                            <TableHead className="w-[100px] text-xs font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5">Hành động</TableHead>
                            <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5">Người dùng</TableHead>
                            <TableHead className="w-[180px] text-xs font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5">Hạn ngạch tiêu thụ</TableHead>
                            <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5">Cửa sổ trượt</TableHead>
                            <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/80 py-3.5">Khôi phục sau</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {apiQuotas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-44 text-center text-xs text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShieldAlert className="w-8 h-8 text-muted-foreground/60 animate-bounce" />
                                        <span>{t("noActiveQuotas")}</span>
                                        <span className="text-[10px] text-muted-foreground/80">Hiện tại không có địa chỉ IP hay tài khoản nào nằm trong danh sách rate limit sliding window.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            apiQuotas.map((quota) => {
                                const ratio = quota.maxLimit > 0 ? (quota.currentRequests / quota.maxLimit) * 100 : 0;
                                const isHigh = ratio >= 80;
                                const isMid = ratio >= 50 && ratio < 80;

                                const quotaProgressColor = isHigh
                                    ? "bg-red-500"
                                    : isMid
                                        ? "bg-amber-500"
                                        : "bg-emerald-500";

                                const badgeColorClass = isHigh
                                    ? "bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20"
                                    : isMid
                                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400"
                                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400";

                                return (
                                    <TableRow key={quota.key} className="group hover:bg-muted/40 transition-all">
                                        <TableCell className="align-middle font-mono text-[10px] text-muted-foreground select-all break-all max-w-[200px] py-4">
                                            {quota.key}
                                        </TableCell>
                                        <TableCell className="align-middle">
                                            <Badge variant="outline" className="text-[10px] bg-secondary font-semibold border-border/40 text-foreground py-0.5">
                                                {quota.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="align-middle">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-xs text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {quota.username || "Khách"}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground font-mono">
                                                    {quota.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-middle">
                                            <div className="flex flex-col gap-1.5 w-full">
                                                <div className="flex items-center justify-between text-[11px] font-semibold">
                                                    <span className="font-mono">{quota.currentRequests} / {quota.maxLimit}</span>
                                                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] border font-bold ${badgeColorClass}`}>
                                                        {ratio.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-500 ${quotaProgressColor}`} style={{ width: `${ratio}%` }} />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-middle text-xs text-muted-foreground font-sans">
                                            {quota.windowSeconds} giây trượt
                                        </TableCell>
                                        <TableCell className="align-middle text-right py-4">
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
