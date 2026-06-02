"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, GlobeIcon, Pencil, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LearningPathDetailHeaderProps {
    learningPath: {
        name: string;
        description: string;
        isPublished: boolean;
    };
    onEdit: () => void;
    onTogglePublish: () => void;
    isTogglePublishPending?: boolean;
}

export function LearningPathDetailHeader({
    learningPath,
    onEdit,
    onTogglePublish,
    isTogglePublishPending = false,
}: LearningPathDetailHeaderProps) {
    const t = useTranslations("learningPaths");

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/20">
            <div className="flex items-center gap-3 min-w-0">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href="/learning-paths" />}
                    className="shrink-0 text-muted-foreground hover:text-foreground rounded-lg size-8"
                >
                    <ArrowLeft className="size-4" />
                </Button>

                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-lg sm:text-xl font-heading font-extrabold tracking-tight truncate text-foreground">
                            {learningPath.name}
                        </h1>
                        {learningPath.isPublished ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                <GlobeIcon className="mr-1 size-3" />
                                {t("published")}
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-border/20 bg-muted/60 text-muted-foreground">
                                {t("draft")}
                            </Badge>
                        )}
                    </div>
                    {learningPath.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5 leading-relaxed">
                            {learningPath.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onTogglePublish}
                    disabled={isTogglePublishPending}
                    className={
                        learningPath.isPublished
                            ? "text-amber-700 border-amber-500/30 hover:bg-amber-500/10 dark:text-amber-400 rounded-xl h-8.5 text-xs font-bold transition-colors"
                            : "text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10 dark:text-emerald-400 rounded-xl h-8.5 text-xs font-bold transition-colors"
                    }
                >
                    <Rocket className="size-3.5 mr-1.5" />
                    {learningPath.isPublished ? t("unpublish") : t("publish")}
                </Button>
                <Button size="sm" onClick={onEdit} className="rounded-xl h-8.5 text-xs font-bold">
                    <Pencil className="size-3.5 mr-1.5" />
                    {t("edit")}
                </Button>
            </div>
        </div>
    );
}
