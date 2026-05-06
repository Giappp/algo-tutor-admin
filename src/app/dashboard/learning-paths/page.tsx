"use client";

import {useState} from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,} from "@/components/ui/sheet";
import {LearningPathTable} from "@/components/learning-path/learning-path-table";
import {LearningPathGrid} from "@/components/learning-path/learning-path-grid";
import {Pagination} from "@/components/learning-path/pagination";
import {useDeleteLearningPath, useLearningPaths, useTogglePublishLearningPath} from "@/hooks/use-learning-paths";
import {LearningPathListParams} from "@/api/services/learning-path-services";
import {LearningPath, Level} from "@/types/learning-path";

const LEVEL_OPTIONS: { value: Level | "ALL"; label: string }[] = [
    {value: "ALL", label: "All Levels"},
    {value: "BEGINNER", label: "Beginner"},
    {value: "INTERMEDIATE", label: "Intermediate"},
    {value: "ADVANCED", label: "Advanced"},
];

const PAGE_SIZES = [10, 20, 50, 100];

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

interface EnhancedStatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
    progress?: number;
    progressLabel?: string;
    accentColor?: "indigo" | "emerald" | "amber" | "rose";
}

function EnhancedStatCard({
                              title,
                              value,
                              icon,
                              description,
                              progress,
                              progressLabel,
                              accentColor = "indigo",
                          }: EnhancedStatCardProps) {
    const colorClasses = {
        indigo: "from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20",
        emerald: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20",
        amber: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20",
        rose: "from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20",
    };

    const iconColorClasses = {
        indigo: "text-indigo-600 dark:text-indigo-400",
        emerald: "text-emerald-600 dark:text-emerald-400",
        amber: "text-amber-600 dark:text-amber-400",
        rose: "text-rose-600 dark:text-rose-400",
    };

    const shadowClasses = {
        indigo: "group-hover:shadow-indigo-500/10",
        emerald: "group-hover:shadow-emerald-500/10",
        amber: "group-hover:shadow-amber-500/10",
        rose: "group-hover:shadow-rose-500/10",
    };

    return (
        <div
            className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 hover:-translate-y-0.5">
            {/* Gradient background */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${colorClasses[accentColor]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            {/* Top accent line */}
            <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${colorClasses[accentColor]}`}/>

            <div className="relative flex items-start justify-between">
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                        {title}
                    </span>
                    <span className="text-3xl font-bold tracking-tight text-foreground">
                        {value}
                    </span>
                    {description && (
                        <span className="text-xs text-muted-foreground/80">{description}</span>
                    )}
                    {progress !== undefined && (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${colorClasses[accentColor]}`}
                                    style={{width: `${Math.min(progress, 100)}%`}}
                                />
                            </div>
                            {progressLabel && (
                                <span className="text-[10px] text-muted-foreground">
                                    {progressLabel}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div
                    className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[accentColor]} p-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${shadowClasses[accentColor]}`}
                >
                    <div className={iconColorClasses[accentColor]}>{icon}</div>
                </div>
            </div>
        </div>
    );
}

export default function LearningPathsPage() {
    const [params, setParams] = useState<LearningPathListParams>({
        page: 0,
        size: 10,
        level: undefined,
        search: "",
    });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [previewLp, setPreviewLp] = useState<LearningPath | null>(null);

    const {data, isLoading, isFetching} = useLearningPaths(params);
    const deleteMutation = useDeleteLearningPath();
    const togglePublishMutation = useTogglePublishLearningPath();

    const learningPaths: LearningPath[] = data?.data ?? ([] as LearningPath[]);

    const handleSearchChange = (value: string) => {
        setParams((prev) => ({...prev, search: value, page: 0}));
    };

    const handleLevelChange = (value: string) => {
        setParams((prev) => ({
            ...prev,
            level: value === "ALL" ? undefined : value,
            page: 0,
        }));
    };

    const handlePageChange = (page: number) => {
        setParams((prev) => ({...prev, page}));
    };

    const handlePageSizeChange = (size: number) => {
        setParams((prev) => ({...prev, size, page: 0}));
    };

    const handleBulkPublish = () => {
        selectedIds.forEach((id) => {
            togglePublishMutation.mutate(id);
        });
        setSelectedIds([]);
    };

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedIds.length} learning path(s)?`)) {
            selectedIds.forEach((id) => {
                deleteMutation.mutate(id);
            });
            setSelectedIds([]);
        }
    };

    // Calculate stats from data
    const stats = {
        total: data?.totalElements ?? 0,
        published: learningPaths.filter((lp) => lp.isPublished).length,
        totalLessons: learningPaths.reduce((sum, lp) => sum + (lp.totalLessonCount || 0), 0),
        totalEnrollments: learningPaths.reduce((sum, lp) => sum + (lp.enrollmentCount || 0), 0),
    };

    const hasActiveFilters = params.search || params.level;

    return (
        <div className="flex flex-col gap-6 mx-auto p-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                        <GraduationCapIcon className="size-5 text-indigo-600 dark:text-indigo-400"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Learning Paths
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your curriculum and structured learning journeys.
                        </p>
                    </div>
                </div>
                <Button nativeButton={false} render={<Link href="/dashboard/learning-paths/create"/>}>
                    <PlusIcon data-icon="inline-start"/>
                    New Learning Path
                </Button>
            </div>

            {/* Stats Cards */}
            {!isLoading && stats.total > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <EnhancedStatCard
                        title="Total Paths"
                        value={stats.total}
                        icon={<GraduationCapIcon className="size-5"/>}
                        accentColor="indigo"
                    />
                    <EnhancedStatCard
                        title="Active Paths"
                        value={stats.published}
                        icon={<GlobeIcon className="size-5"/>}
                        description="Currently published"
                        progress={stats.total > 0 ? (stats.published / stats.total) * 100 : 0}
                        progressLabel={`${stats.total - stats.published} drafts`}
                        accentColor="emerald"
                    />
                    <EnhancedStatCard
                        title="Total Lessons"
                        value={stats.totalLessons}
                        icon={<BookOpenIcon className="size-5"/>}
                        description="Across all paths"
                        accentColor="amber"
                    />
                    <EnhancedStatCard
                        title="Enrollments"
                        value={stats.totalEnrollments}
                        icon={<UsersIcon className="size-5"/>}
                        description="Student enrollments"
                        accentColor="rose"
                    />
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                    <SearchIcon
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"/>
                    <Input
                        placeholder="Search learning paths..."
                        value={params.search ?? ""}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select
                    value={params.level ?? "ALL"}
                    onValueChange={(v) => handleLevelChange(v ?? "ALL")}
                >
                    <SelectTrigger className="w-full sm:w-44">
                        <SelectValue placeholder="All Levels"/>
                    </SelectTrigger>
                    <SelectContent>
                        {LEVEL_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={String(params.size ?? 10)}
                    onValueChange={(v) => handlePageSizeChange(Number(v ?? 10))}
                >
                    <SelectTrigger className="w-full sm:w-32">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        {PAGE_SIZES.map((size) => (
                            <SelectItem key={size} value={String(size)}>
                                {size} / page
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-all ${
                            viewMode === "list"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <ListIcon className="size-4"/>
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-all ${
                            viewMode === "grid"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <LayoutGridIcon className="size-4"/>
                    </button>
                </div>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Active filters:</span>
                    {params.search && (
                        <Badge variant="secondary" className="gap-1">
                            Search: {params.search}
                            <button onClick={() => handleSearchChange("")} className="ml-1 hover:text-foreground">
                                x
                            </button>
                        </Badge>
                    )}
                    {params.level && (
                        <Badge variant="secondary" className="gap-1">
                            Level: {params.level}
                            <button onClick={() => handleLevelChange("ALL")} className="ml-1 hover:text-foreground">
                                x
                            </button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between rounded-xl border bg-muted/50 p-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{selectedIds.length} selected</span>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                            Clear
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            nativeButton={false}
                            variant="outline"
                            size="sm"
                            onClick={handleBulkPublish}
                            render={<GlobeIcon data-icon="inline-start" className="size-4"/>}
                        >
                            Publish All
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            render={<TrashIcon data-icon="inline-start" className="size-4"/>}
                            onClick={handleBulkDelete}
                        >
                            Delete All
                        </Button>
                    </div>
                </div>
            )}

            {/* Content - Table or Grid */}
            {viewMode === "list" ? (
                <LearningPathTable
                    data={learningPaths}
                    isLoading={isLoading}
                    onTogglePublish={(id) => togglePublishMutation.mutate(id)}
                    onDelete={(id) => {
                        if (confirm("Are you sure you want to delete this learning path?")) {
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
                        if (confirm("Are you sure you want to delete this learning path?")) {
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
            <Pagination
                meta={{
                    page: data?.currentPage ?? 0,
                    size: data?.pageSize ?? 10,
                    totalElements: data?.totalElements ?? 0,
                    totalPages: data?.totalPages ?? 0,
                    hasNext: data?.hasNext ?? false,
                    hasPrevious: data?.hasPrevious ?? false,
                }}
                onPageChange={handlePageChange}
                isLoading={isFetching && !isLoading}
            />

            {/* Preview Side Panel */}
            <Sheet open={!!previewLp} onOpenChange={(open) => !open && setPreviewLp(null)}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    {previewLp && (
                        <>
                            <SheetHeader>
                                <SheetTitle>Learning Path Preview</SheetTitle>
                                <SheetDescription>
                                    Preview of {previewLp.name}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Thumbnail */}
                                <div
                                    className="relative h-48 w-full overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                                    {previewLp.thumbnailUrl ? (
                                        <Image
                                            src={previewLp.thumbnailUrl}
                                            alt={previewLp.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center">
                                            <GraduationCapIcon className="size-16 text-indigo-500/30"/>
                                        </div>
                                    )}

                                    {/* Level badge */}
                                    <div className="absolute right-3 top-3">
                                        <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                                LEVEL_COLORS[previewLp.level].bg
                                            } ${LEVEL_COLORS[previewLp.level].text}`}
                                        >
                                            {previewLp.level.charAt(0) +
                                                previewLp.level.slice(1).toLowerCase()}
                                        </span>
                                    </div>

                                    {/* Status badge */}
                                    {previewLp.deleted && (
                                        <div className="absolute left-3 bottom-3">
                                            <Badge variant="destructive">Deleted</Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Title & Description */}
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">
                                        {previewLp.name}
                                    </h2>
                                    {previewLp.description && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {previewLp.description}
                                        </p>
                                    )}
                                </div>

                                <Separator/>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                            <LayersIcon className="size-4"/>
                                        </div>
                                        <p className="mt-1 text-2xl font-bold">{previewLp.topicCount}</p>
                                        <p className="text-xs text-muted-foreground">Topics</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                            <BookOpenIcon className="size-4"/>
                                        </div>
                                        <p className="mt-1 text-2xl font-bold">
                                            {previewLp.publishedLessonCount}/{previewLp.totalLessonCount}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Lessons</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                            <UsersIcon className="size-4"/>
                                        </div>
                                        <p className="mt-1 text-2xl font-bold">{previewLp.enrollmentCount}</p>
                                        <p className="text-xs text-muted-foreground">Enrollments</p>
                                    </div>
                                </div>

                                {/* Progress */}
                                {previewLp.totalLessonCount > 0 && (
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Content Published</span>
                                            <span className="font-medium">
                                                {Math.round(
                                                    (previewLp.publishedLessonCount /
                                                        previewLp.totalLessonCount) *
                                                    100
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                style={{
                                                    width: `${
                                                        (previewLp.publishedLessonCount /
                                                            previewLp.totalLessonCount) *
                                                        100
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Separator/>

                                {/* Actions */}
                                <div className="flex flex-col gap-3">
                                    <Button
                                        render={<Link href={`/dashboard/learning-paths/${previewLp.id}`}/>}
                                        className="w-full"
                                    >
                                        <Pencil data-icon="inline-start" className="size-4"/>
                                        Edit Learning Path
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => togglePublishMutation.mutate(previewLp.id)}
                                        className="w-full"
                                    >
                                        <Rocket data-icon="inline-start" className="size-4"/>
                                        {previewLp.isPublished ? "Unpublish" : "Publish"}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
