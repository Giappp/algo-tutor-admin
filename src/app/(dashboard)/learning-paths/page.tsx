"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
    BookOpenIcon,
    GlobeIcon,
    GraduationCapIcon,
    LayersIcon,
    LayoutGridIcon,
    ListIcon,
    Pencil,
    PlusIcon,
    Rocket,
    SearchIcon,
    TrashIcon,
    UsersIcon,
    Info,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { LearningPathTable } from "@/components/learning-path/learning-path-table";
import { LearningPathGrid } from "@/components/learning-path/learning-path-grid";
import { Pagination } from "@/components/learning-path/pagination";
import { useDeleteLearningPath, useLearningPaths, useTogglePublishLearningPath } from "@/hooks/use-learning-paths";
import { LearningPathListParams } from "@/api/services/learning-path-services";
import { LearningPath, Level } from "@/types/learning-path";

const PAGE_SIZES = [10, 20, 50];

const LEVEL_COLORS: Record<Level, { bg: string; text: string }> = {
    BEGINNER: {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
    },
    INTERMEDIATE: {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
    },
    ADVANCED: {
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
    },
};

type ViewMode = "list" | "grid";

export default function LearningPathsPage() {
    const t = useTranslations("learningPaths");
    const [params, setParams] = useState<LearningPathListParams>({
        page: 0,
        size: 10,
        level: undefined,
        search: "",
    });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [previewLp, setPreviewLp] = useState<LearningPath | null>(null);

    const { data, isLoading, isFetching } = useLearningPaths(params);
    const deleteMutation = useDeleteLearningPath();
    const togglePublishMutation = useTogglePublishLearningPath();

    const learningPaths: LearningPath[] = data?.data ?? [];

    const handleSearchChange = (value: string) => {
        setParams((prev) => ({ ...prev, search: value, page: 0 }));
    };

    const handleLevelChange = (value: string) => {
        setParams((prev) => ({
            ...prev,
            level: value === "ALL" ? undefined : value,
            page: 0,
        }));
    };

    const handlePageChange = (page: number) => {
        setParams((prev) => ({ ...prev, page }));
    };

    const handlePageSizeChange = (size: number) => {
        setParams((prev) => ({ ...prev, size, page: 0 }));
    };

    const handleBulkPublish = () => {
        if (confirm(t("bulkPublishConfirm"))) {
            selectedIds.forEach((id) => togglePublishMutation.mutate(id));
            setSelectedIds([]);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(t("bulkDeleteConfirm", { count: selectedIds.length }))) {
            selectedIds.forEach((id) => deleteMutation.mutate(id));
            setSelectedIds([]);
        }
    };

    // Stats from current page data
    const stats = {
        total: data?.totalElements ?? 0,
        published: learningPaths.filter((lp) => lp.isPublished).length,
        totalLessons: learningPaths.reduce((sum, lp) => sum + (lp.totalLessonCount || 0), 0),
        totalEnrollments: learningPaths.reduce((sum, lp) => sum + (lp.enrollmentCount || 0), 0),
    };

    const getLevelText = (level: Level) => {
        switch (level) {
            case "BEGINNER": return t("beginner");
            case "INTERMEDIATE": return t("intermediate");
            case "ADVANCED": return t("advanced");
            default: return level;
        }
    };

    const levelOptions = [
        { value: "ALL", label: t("allLevels") },
        { value: "BEGINNER", label: t("beginner") },
        { value: "INTERMEDIATE", label: t("intermediate") },
        { value: "ADVANCED", label: t("advanced") },
    ];

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto stagger-children">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute right-[-10%] top-[-10%] -z-10 size-[500px] rounded-full bg-[radial-gradient(circle,oklch(0.62_0.15_225/0.06)_0%,transparent_70%)] animate-gradient-shift" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-3xl font-heading font-extrabold text-gradient tracking-tight select-none">
                        {t("title")}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>
                <Button nativeButton={false} render={<Link href="/learning-paths/create" />} className="shrink-0 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300">
                    <PlusIcon className="size-4 mr-2" />
                    {t("newPath")}
                </Button>
            </div>

            {/* Quick Stats Bar */}
            {!isLoading && stats.total > 0 && (
                <div className="relative overflow-hidden flex flex-wrap items-center gap-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card/85 to-muted/20 px-6 py-4 shadow-sm backdrop-blur-md">
                    <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
                    
                    <div className="flex items-center gap-2.5 text-xs">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                            <GraduationCapIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-foreground tracking-tight font-mono text-sm leading-none">{stats.total}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-wider">{t("total")}</span>
                        </div>
                    </div>

                    <Separator orientation="vertical" className="h-7 bg-border/40" />

                    <div className="flex items-center gap-2.5 text-xs">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                            <GlobeIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-foreground tracking-tight font-mono text-sm leading-none">{stats.published}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-wider">{t("published")}</span>
                        </div>
                    </div>

                    <Separator orientation="vertical" className="h-7 bg-border/40" />

                    <div className="flex items-center gap-2.5 text-xs">
                        <div className="shrink-0 rounded-lg border border-blue-500/20 bg-blue-500/10 p-1.5 text-blue-700 dark:text-blue-300">
                            <BookOpenIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-foreground tracking-tight font-mono text-sm leading-none">{stats.totalLessons}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-wider">{t("lessons")}</span>
                        </div>
                    </div>

                    <Separator orientation="vertical" className="h-7 bg-border/40" />

                    <div className="flex items-center gap-2.5 text-xs">
                        <div className="shrink-0 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-1.5 text-cyan-700 dark:text-cyan-300">
                            <UsersIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-foreground tracking-tight font-mono text-sm leading-none">{stats.totalEnrollments}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-wider">{t("enrollments")}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar: Search + Filters + View Toggle */}
            <div className="flex flex-col gap-3 rounded-xl border border-border/75 bg-card p-3 shadow-[0_10px_30px_-28px_oklch(0.42_0.12_240/0.35)] sm:flex-row sm:items-center sm:p-4">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80 pointer-events-none" />
                    <Input
                        placeholder={t("searchPlaceholder")}
                        value={params.search ?? ""}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="h-10 rounded-lg border-input bg-background pl-10 transition-all focus:border-primary/60"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    <Select
                        value={params.level ?? "ALL"}
                        onValueChange={(v) => handleLevelChange(v ?? "ALL")}
                    >
                        <SelectTrigger className="h-10 w-36 rounded-lg border-input bg-background text-xs font-medium text-foreground/80">
                            <SelectValue placeholder={t("allLevels")} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40">
                            {levelOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={String(params.size ?? 10)}
                        onValueChange={(v) => handlePageSizeChange(Number(v ?? 10))}
                    >
                        <SelectTrigger className="h-10 w-32 rounded-lg border-input bg-background text-xs font-medium text-foreground/80">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40">
                            {PAGE_SIZES.map((size) => (
                                <SelectItem key={size} value={String(size)} className="text-xs">
                                    {t("itemsPerPage", { size })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="flex shrink-0 items-center rounded-lg border border-border/70 bg-muted/35 p-0.5">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${viewMode === "list"
                                ? "border border-border/40 bg-card text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                            aria-label="List view"
                        >
                            <ListIcon className="size-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${viewMode === "grid"
                                ? "border border-border/40 bg-card text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                            aria-label="Grid view"
                        >
                            <LayoutGridIcon className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filters */}
            {(params.search || params.level) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("filters")}</span>
                    {params.search && (
                        <Badge variant="secondary" className="gap-1.5 text-[11px] font-semibold bg-muted border border-border/30 rounded-lg py-0.5 pl-2.5 pr-1.5 text-foreground/80">
                            &quot;{params.search}&quot;
                            <button
                                onClick={() => handleSearchChange("")}
                                className="hover:bg-foreground/10 text-muted-foreground hover:text-foreground p-0.5 rounded-md transition-colors"
                                aria-label="Remove search filter"
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    )}
                    {params.level && (
                        <Badge variant="secondary" className="gap-1.5 text-[11px] font-semibold bg-muted border border-border/30 rounded-lg py-0.5 pl-2.5 pr-1.5 text-foreground/80">
                            {getLevelText(params.level as Level)}
                            <button
                                onClick={() => handleLevelChange("ALL")}
                                className="hover:bg-foreground/10 text-muted-foreground hover:text-foreground p-0.5 rounded-md transition-colors"
                                aria-label="Remove level filter"
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="relative overflow-hidden flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/[0.03] px-5 py-3 shadow-inner">
                    <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
                    <span className="text-xs font-extrabold text-foreground tracking-tight">
                        {t("selected", { count: selectedIds.length })}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkPublish}
                            className="text-emerald-600 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 dark:text-emerald-400 rounded-xl text-xs font-bold"
                        >
                            <Rocket className="size-3.5 mr-1.5" />
                            {t("publish")}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="rounded-xl text-xs font-bold"
                        >
                            <TrashIcon className="size-3.5 mr-1.5" />
                            {t("delete")}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground">
                            {t("clear")}
                        </Button>
                    </div>
                </div>
            )}

            {/* Content */}
            {viewMode === "list" ? (
                <LearningPathTable
                    data={learningPaths}
                    isLoading={isLoading}
                    onTogglePublish={(id) => togglePublishMutation.mutate(id)}
                    onDelete={(id) => {
                        if (confirm(t("deleteConfirm"))) {
                            deleteMutation.mutate(id);
                        }
                    }}
                    onSelect={(id, selected) => {
                        if (selected) {
                            setSelectedIds((prev) => [...prev, id]);
                        } else {
                            setSelectedIds((prev) => prev.filter((i) => i !== id));
                        }
                    }}
                    selectedIds={selectedIds}
                    onPreview={(lp) => setPreviewLp(lp)}
                />
            ) : (
                <LearningPathGrid
                    data={learningPaths}
                    isLoading={isLoading}
                    onTogglePublish={(id) => togglePublishMutation.mutate(id)}
                    onDelete={(id) => {
                        if (confirm(t("deleteConfirm"))) {
                            deleteMutation.mutate(id);
                        }
                    }}
                    onSelect={(id, selected) => {
                        if (selected) {
                            setSelectedIds((prev) => [...prev, id]);
                        } else {
                            setSelectedIds((prev) => prev.filter((i) => i !== id));
                        }
                    }}
                    selectedIds={selectedIds}
                    onPreview={(lp) => setPreviewLp(lp)}
                />
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_14px_40px_-32px_oklch(0.42_0.12_240/0.35)]">
                    <Pagination
                        meta={{
                            page: data.currentPage,
                            size: data.pageSize,
                            totalElements: data.totalElements,
                            totalPages: data.totalPages,
                            hasNext: data.hasNext,
                            hasPrevious: data.hasPrevious,
                        }}
                        onPageChange={handlePageChange}
                        isLoading={isFetching && !isLoading}
                    />
                </div>
            )}

            {/* Preview Side Panel */}
            <Sheet open={!!previewLp} onOpenChange={(open) => !open && setPreviewLp(null)}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto rounded-l-3xl border-l border-border/40 bg-gradient-to-b from-card to-card/95 relative p-6">
                    <div className="absolute inset-0 noise-overlay opacity-[0.015] pointer-events-none" />
                    {previewLp && (
                        <div className="flex flex-col gap-6">
                            <SheetHeader className="text-left">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{t("previewTitle")}</span>
                                <SheetTitle className="text-xl font-heading font-extrabold tracking-tight mt-1">{previewLp.name}</SheetTitle>
                                <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                                    {t("previewSubtitle")}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="space-y-6">
                                {/* Thumbnail */}
                                <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-muted/60 border border-border/30 shadow-inner">
                                    {previewLp.thumbnailUrl ? (
                                        <Image
                                            src={previewLp.thumbnailUrl}
                                            alt={previewLp.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
                                            <GraduationCapIcon className="size-16 text-muted-foreground/30" />
                                        </div>
                                    )}

                                    {/* Level badge */}
                                    <div className="absolute right-3.5 top-3.5">
                                        <span
                                            className={`inline-flex items-center rounded-xl border px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${LEVEL_COLORS[previewLp.level].bg
                                                } ${LEVEL_COLORS[previewLp.level].text}`}
                                        >
                                            {getLevelText(previewLp.level)}
                                        </span>
                                    </div>

                                    {previewLp.deleted && (
                                        <div className="absolute left-3.5 bottom-3.5">
                                            <Badge variant="destructive" className="rounded-lg font-bold text-[9px] uppercase tracking-wide">Deleted</Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {previewLp.description && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                                            &ldquo;{previewLp.description}&rdquo;
                                        </p>
                                    </div>
                                )}

                                {/* Goal */}
                                {previewLp.goal && (
                                    <div className="relative overflow-hidden flex gap-3 p-4 bg-muted/30 border border-border/30 rounded-2xl">
                                        <Info className="size-4.5 text-primary shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{t("previewGoal")}</span>
                                            <p className="text-xs leading-relaxed text-foreground/90 font-medium">{previewLp.goal}</p>
                                        </div>
                                    </div>
                                )}

                                <Separator className="bg-border/40" />

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex flex-col items-center text-center rounded-2xl border border-border/40 bg-muted/10 p-3.5 transition-all hover:bg-muted/20">
                                        <LayersIcon className="size-4 text-muted-foreground mb-1.5" />
                                        <span className="text-lg font-extrabold font-mono text-foreground">{previewLp.topicCount}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{t("topicsCountTitle")}</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center rounded-2xl border border-border/40 bg-muted/10 p-3.5 transition-all hover:bg-muted/20">
                                        <BookOpenIcon className="size-4 text-muted-foreground mb-1.5" />
                                        <span className="text-lg font-extrabold font-mono text-foreground">
                                            {previewLp.publishedLessonCount}/{previewLp.totalLessonCount}
                                        </span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{t("lessons")}</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center rounded-2xl border border-border/40 bg-muted/10 p-3.5 transition-all hover:bg-muted/20">
                                        <UsersIcon className="size-4 text-muted-foreground mb-1.5" />
                                        <span className="text-lg font-extrabold font-mono text-foreground">{previewLp.enrollmentCount}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Enrolled</span>
                                    </div>
                                </div>

                                {/* Progress */}
                                {previewLp.totalLessonCount > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span className="text-muted-foreground">{t("contentProgress")}</span>
                                            <span className="font-mono text-foreground">
                                                {Math.round(
                                                    (previewLp.publishedLessonCount / previewLp.totalLessonCount) * 100
                                                )}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted/80 border border-border/30">
                                            <div
                                                className="h-full rounded-full bg-primary/80 transition-all duration-500 shadow-sm"
                                                style={{
                                                    width: `${(previewLp.publishedLessonCount / previewLp.totalLessonCount) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Separator className="bg-border/40" />

                                {/* Actions */}
                                <div className="flex flex-col gap-2.5">
                                    <Button
                                        render={<Link href={`/learning-paths/${previewLp.id}`} />}
                                        className="w-full rounded-xl h-10 font-bold text-xs"
                                    >
                                        <Pencil className="size-4 mr-2" />
                                        {t("editLearningPath")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => togglePublishMutation.mutate(previewLp.id)}
                                        className={
                                            previewLp.isPublished
                                                ? "w-full rounded-xl h-10 font-bold text-xs text-amber-600 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 dark:text-amber-400"
                                                : "w-full rounded-xl h-10 font-bold text-xs text-emerald-600 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 dark:text-emerald-400"
                                        }
                                    >
                                        <Rocket className="size-4 mr-2" />
                                        {previewLp.isPublished ? t("unpublish") : t("publish")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
