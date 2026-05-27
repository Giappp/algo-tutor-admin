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

    const learningPaths: LearningPath[] = data?.data ?? [];

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
        selectedIds.forEach((id) => togglePublishMutation.mutate(id));
        setSelectedIds([]);
    };

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedIds.length} learning path(s)?`)) {
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

    return (
        <div className="flex flex-col gap-5 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Learning Paths</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage curriculum and structured learning journeys
                    </p>
                </div>
                <Button nativeButton={false} render={<Link href="/dashboard/learning-paths/create"/>}>
                    <PlusIcon data-icon="inline-start"/>
                    New Path
                </Button>
            </div>

            {/* Quick Stats Bar */}
            {!isLoading && stats.total > 0 && (
                <div className="flex items-center gap-6 rounded-lg border bg-muted/30 px-5 py-3">
                    <div className="flex items-center gap-2 text-sm">
                        <GraduationCapIcon className="size-4 text-muted-foreground"/>
                        <span className="font-semibold">{stats.total}</span>
                        <span className="text-muted-foreground">total</span>
                    </div>
                    <Separator orientation="vertical" className="h-5"/>
                    <div className="flex items-center gap-2 text-sm">
                        <GlobeIcon className="size-4 text-emerald-600 dark:text-emerald-400"/>
                        <span className="font-semibold">{stats.published}</span>
                        <span className="text-muted-foreground">published</span>
                    </div>
                    <Separator orientation="vertical" className="h-5"/>
                    <div className="flex items-center gap-2 text-sm">
                        <BookOpenIcon className="size-4 text-muted-foreground"/>
                        <span className="font-semibold">{stats.totalLessons}</span>
                        <span className="text-muted-foreground">lessons</span>
                    </div>
                    <Separator orientation="vertical" className="h-5"/>
                    <div className="flex items-center gap-2 text-sm">
                        <UsersIcon className="size-4 text-muted-foreground"/>
                        <span className="font-semibold">{stats.totalEnrollments}</span>
                        <span className="text-muted-foreground">enrollments</span>
                    </div>
                </div>
            )}

            {/* Toolbar: Search + Filters + View Toggle */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <SearchIcon
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"/>
                    <Input
                        placeholder="Search by name..."
                        value={params.search ?? ""}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={params.level ?? "ALL"}
                        onValueChange={(v) => handleLevelChange(v ?? "ALL")}
                    >
                        <SelectTrigger className="w-36 h-9">
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
                        <SelectTrigger className="w-28 h-9">
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
                    <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`inline-flex items-center justify-center rounded-md p-1.5 transition-all ${
                                viewMode === "list"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            aria-label="List view"
                        >
                            <ListIcon className="size-4"/>
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`inline-flex items-center justify-center rounded-md p-1.5 transition-all ${
                                viewMode === "grid"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            aria-label="Grid view"
                        >
                            <LayoutGridIcon className="size-4"/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filters */}
            {(params.search || params.level) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Filters:</span>
                    {params.search && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                            &quot;{params.search}&quot;
                            <button
                                onClick={() => handleSearchChange("")}
                                className="ml-0.5 hover:text-foreground"
                                aria-label="Remove search filter"
                            >
                                ×
                            </button>
                        </Badge>
                    )}
                    {params.level && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                            {params.level}
                            <button
                                onClick={() => handleLevelChange("ALL")}
                                className="ml-0.5 hover:text-foreground"
                                aria-label="Remove level filter"
                            >
                                ×
                            </button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
                    <span className="text-sm font-medium">
                        {selectedIds.length} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkPublish}
                            className="text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10 dark:text-emerald-400"
                        >
                            <Rocket data-icon="inline-start" className="size-3.5"/>
                            Publish
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                        >
                            <TrashIcon data-icon="inline-start" className="size-3.5"/>
                            Delete
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                            Clear
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
            {data && data.totalPages > 1 && (
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
            )}

            {/* Preview Side Panel */}
            <Sheet open={!!previewLp} onOpenChange={(open) => !open && setPreviewLp(null)}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    {previewLp && (
                        <>
                            <SheetHeader>
                                <SheetTitle>{previewLp.name}</SheetTitle>
                                <SheetDescription>
                                    Quick preview
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-5">
                                {/* Thumbnail */}
                                <div className="relative h-44 w-full overflow-hidden rounded-lg bg-muted">
                                    {previewLp.thumbnailUrl ? (
                                        <Image
                                            src={previewLp.thumbnailUrl}
                                            alt={previewLp.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center">
                                            <GraduationCapIcon className="size-14 text-muted-foreground/30"/>
                                        </div>
                                    )}

                                    {/* Level badge */}
                                    <div className="absolute right-3 top-3">
                                        <span
                                            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                                                LEVEL_COLORS[previewLp.level].bg
                                            } ${LEVEL_COLORS[previewLp.level].text}`}
                                        >
                                            {previewLp.level.charAt(0) + previewLp.level.slice(1).toLowerCase()}
                                        </span>
                                    </div>

                                    {previewLp.deleted && (
                                        <div className="absolute left-3 bottom-3">
                                            <Badge variant="destructive">Deleted</Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {previewLp.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {previewLp.description}
                                    </p>
                                )}

                                {/* Goal */}
                                {previewLp.goal && (
                                    <div className="rounded-lg border bg-muted/30 p-3">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Goal</p>
                                        <p className="text-sm">{previewLp.goal}</p>
                                    </div>
                                )}

                                <Separator/>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center rounded-lg border p-3">
                                        <LayersIcon className="mx-auto size-4 text-muted-foreground mb-1"/>
                                        <p className="text-xl font-bold">{previewLp.topicCount}</p>
                                        <p className="text-[11px] text-muted-foreground">Topics</p>
                                    </div>
                                    <div className="text-center rounded-lg border p-3">
                                        <BookOpenIcon className="mx-auto size-4 text-muted-foreground mb-1"/>
                                        <p className="text-xl font-bold">
                                            {previewLp.publishedLessonCount}/{previewLp.totalLessonCount}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">Lessons</p>
                                    </div>
                                    <div className="text-center rounded-lg border p-3">
                                        <UsersIcon className="mx-auto size-4 text-muted-foreground mb-1"/>
                                        <p className="text-xl font-bold">{previewLp.enrollmentCount}</p>
                                        <p className="text-[11px] text-muted-foreground">Enrolled</p>
                                    </div>
                                </div>

                                {/* Progress */}
                                {previewLp.totalLessonCount > 0 && (
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Content progress</span>
                                            <span className="font-medium">
                                                {Math.round(
                                                    (previewLp.publishedLessonCount / previewLp.totalLessonCount) * 100
                                                )}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all"
                                                style={{
                                                    width: `${(previewLp.publishedLessonCount / previewLp.totalLessonCount) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Separator/>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
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
                                        className={
                                            previewLp.isPublished
                                                ? "w-full text-amber-700 border-amber-500/30 hover:bg-amber-500/10 dark:text-amber-400"
                                                : "w-full text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10 dark:text-emerald-400"
                                        }
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
