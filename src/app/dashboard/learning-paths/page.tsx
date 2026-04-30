"use client";

import {useState} from "react";
import Link from "next/link";
import {BookOpenIcon, GlobeIcon, GraduationCapIcon, PlusIcon, SearchIcon, TrashIcon, UsersIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {LearningPathTable} from "@/components/learning-path/learning-path-table";
import {Pagination} from "@/components/learning-path/pagination";
import {LearningPathPreviewCard} from "@/components/learning-path/preview-card";
import {useDeleteLearningPath, useLearningPaths, useTogglePublishLearningPath,} from "@/hooks/use-learning-paths";
import {LearningPathListParams} from "@/api/services/learning-path-services";
import {LearningPath, Level} from "@/types/learning-path";

const LEVEL_OPTIONS: { value: Level | "ALL"; label: string }[] = [
    {value: "ALL", label: "All Levels"},
    {value: "BEGINNER", label: "Beginner"},
    {value: "INTERMEDIATE", label: "Intermediate"},
    {value: "ADVANCED", label: "Advanced"},
];

const PAGE_SIZES = [10, 20, 50, 100];

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
}

function StatCard({title, value, icon, description}: StatCardProps) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground">{title}</p>
                    <p className="mt-1 text-2xl font-bold">{value}</p>
                    {description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    {icon}
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
    const [showPreview, setShowPreview] = useState<LearningPath | null>(null);

    const {data, isLoading, isFetching} = useLearningPaths(params);
    const deleteMutation = useDeleteLearningPath();
    const togglePublishMutation = useTogglePublishLearningPath();

    const meta = data?.meta;
    const learningPaths: LearningPath[] = data?.data ?? [] as LearningPath[];

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
        total: meta?.totalElements ?? 0,
        published: learningPaths.filter((lp) => !lp.deleted).length,
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
                    <StatCard
                        title="Total Paths"
                        value={stats.total}
                        icon={<GraduationCapIcon className="size-5"/>}
                    />
                    <StatCard
                        title="Active Paths"
                        value={stats.published}
                        icon={<GlobeIcon className="size-5"/>}
                        description="Currently published"
                    />
                    <StatCard
                        title="Total Lessons"
                        value={stats.totalLessons}
                        icon={<BookOpenIcon className="size-5"/>}
                        description="Across all paths"
                    />
                    <StatCard
                        title="Enrollments"
                        value={stats.totalEnrollments}
                        icon={<UsersIcon className="size-5"/>}
                        description="Student enrollments"
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
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Active filters:</span>
                    {params.search && (
                        <Badge variant="secondary" className="gap-1">
                            Search: {params.search}
                            <button
                                onClick={() => handleSearchChange("")}
                                className="ml-1 hover:text-foreground"
                            >
                                x
                            </button>
                        </Badge>
                    )}
                    {params.level && (
                        <Badge variant="secondary" className="gap-1">
                            Level: {params.level}
                            <button
                                onClick={() => handleLevelChange("ALL")}
                                className="ml-1 hover:text-foreground"
                            >
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
                        <span className="text-sm font-medium">
                            {selectedIds.length} selected
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedIds([])}
                        >
                            Clear
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleBulkPublish}
                                render={<GlobeIcon data-icon="inline-start" className="size-4"/>}>
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

            {/* Preview Panel */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm">
                        <LearningPathPreviewCard
                            name={showPreview.name}
                            description={showPreview.description}
                            level={showPreview.level}
                            thumbnailUrl={showPreview.thumbnailUrl}
                            lessonCount={showPreview.totalLessonCount}
                            topicCount={showPreview.topicCount}
                            isPublished={!showPreview.deleted}
                        />
                        <Button
                            variant="outline"
                            className="mt-4 w-full"
                            onClick={() => setShowPreview(null)}
                        >
                            Close Preview
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
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
                onPreview={(lp) => setShowPreview(lp)}
            />

            {/* Pagination */}
            {meta && (
                <Pagination
                    meta={{
                        page: meta.page,
                        size: meta.size,
                        totalElements: meta.totalElements,
                        totalPages: meta.totalPages,
                        hasNext: meta.hasNext,
                        hasPrevious: meta.hasPrevious,
                    }}
                    onPageChange={handlePageChange}
                    isLoading={isFetching && !isLoading}
                />
            )}
        </div>
    );
}
