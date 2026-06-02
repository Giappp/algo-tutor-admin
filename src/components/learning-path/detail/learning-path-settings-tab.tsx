"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LearningPathSettingsTabProps {
    learningPathName: string;
    onDelete: () => void;
    isDeletePending?: boolean;
}

export function LearningPathSettingsTab({
    learningPathName,
    onDelete,
    isDeletePending = false,
}: LearningPathSettingsTabProps) {
    const t = useTranslations("learningPaths");
    const tCommon = useTranslations("common");

    return (
        <div className="p-1">
            {/* Danger Zone */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 relative overflow-hidden">
                <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">{t("dangerZone")}</h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground">{t("deletePathSub")}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl">
                            {t("deletePathDescShort", { name: learningPathName })}
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onDelete}
                        disabled={isDeletePending}
                        className="shrink-0 rounded-xl font-bold text-xs h-9 transition-colors shadow-sm"
                    >
                        <Trash2 className="size-3.5 mr-1.5" />
                        {isDeletePending ? t("deleting") : tCommon("delete")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
