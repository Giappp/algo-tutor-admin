"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
    BookOpenIcon,
    EyeIcon,
    Globe,
    GlobeIcon,
    LayersIcon,
    MoreHorizontal,
    Pencil,
    Rocket,
    Trash2,
    UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { LearningPath, Level } from "@/types/learning-path";

const LEVEL_COLORS: Record<Level, string> = {
    BEGINNER: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
    INTERMEDIATE: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
    ADVANCED: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20",
};

interface LearningPathTableProps {
    data: LearningPath[];
    isLoading?: boolean;
    onTogglePublish: (id: number) => void;
    onDelete: (id: number) => void;
    selectedIds?: number[];
    onSelect?: (id: number, selected: boolean) => void;
    onPreview?: (learningPath: LearningPath) => void;
}

export function LearningPathTable({
    data,
    isLoading,
    onTogglePublish,
    onDelete,
    selectedIds = [],
    onSelect,
    onPreview,
}: LearningPathTableProps) {
    const t = useTranslations("learningPaths");
    const router = useRouter();
    const [rowSelection, setRowSelection] = useState({});

    const getLevelText = (level: Level) => {
        switch (level) {
            case "BEGINNER": return t("beginner");
            case "INTERMEDIATE": return t("intermediate");
            case "ADVANCED": return t("advanced");
            default: return level;
        }
    };

    // TanStack Table returns functions that React Compiler cannot safely memoize.
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns: [
            {
                id: "select",
                header: ({ table: t }) => (
                    <Checkbox
                        checked={t.getIsAllPageRowsSelected() ? true : t.getIsSomePageRowsSelected() ? undefined : false}
                        onCheckedChange={(val) => {
                            t.toggleAllPageRowsSelected(val);
                            const allIds = t.getRowModel().rows.map((r) => r.original.id);
                            if (val) {
                                allIds.forEach((id) => onSelect?.(id, true));
                            } else {
                                allIds.forEach((id) => onSelect?.(id, false));
                            }
                        }}
                        aria-label="Select all"
                        className="rounded-md border-border/40"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={selectedIds.includes(row.original.id)}
                        onCheckedChange={(val) => {
                            row.toggleSelected(val);
                            onSelect?.(row.original.id, val);
                        }}
                        aria-label={`Select ${row.original.name}`}
                        className="rounded-md border-border/40"
                    />
                ),
                enableSorting: false,
                size: 40,
            },
            {
                accessorKey: "name",
                header: t("pathName"),
                cell: ({ row }) => (
                    <div className="flex min-w-[220px] max-w-[340px] flex-col gap-1">
                        <span className="text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                            {row.original.name}
                        </span>
                        {row.original.description && (
                            <span className="line-clamp-1 text-xs text-muted-foreground">
                                {row.original.description}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "level",
                header: t("level"),
                size: 120,
                cell: ({ row }) => {
                    const levelClass = LEVEL_COLORS[row.original.level];
                    return (
                        <span
                            className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold ${levelClass}`}
                        >
                            {getLevelText(row.original.level)}
                        </span>
                    );
                },
            },
            {
                id: "stats",
                header: t("content"),
                size: 180,
                cell: ({ row }) => (
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5" title={t("topicsCountTitle")}>
                            <LayersIcon className="size-3.5 text-primary/65" />
                            {row.original.topicCount}
                        </span>
                        <span className="inline-flex items-center gap-1.5" title={t("lessons")}>
                            <BookOpenIcon className="size-3.5 text-primary/65" />
                            {row.original.publishedLessonCount}/{row.original.totalLessonCount}
                        </span>
                        <span className="inline-flex items-center gap-1.5" title={t("enrollments")}>
                            <UsersIcon className="size-3.5 text-primary/65" />
                            {row.original.enrollmentCount}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "isPublished",
                header: t("status"),
                size: 110,
                cell: ({ row }) =>
                    row.original.isPublished ? (
                        <Badge className="rounded-md border border-emerald-500/20 bg-emerald-500/10 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <GlobeIcon className="mr-1 size-3" />
                            {t("published")}
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="rounded-md border border-border/50 bg-muted/45 py-1 text-[10px] font-semibold text-muted-foreground">
                            {t("draft")}
                        </Badge>
                    ),
            },
            {
                id: "actions",
                header: () => <span className="sr-only">Actions</span>,
                size: 140,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" onClick={(e) => e.stopPropagation()}>
                        {/* Preview */}
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-8 rounded-md text-muted-foreground transition-colors hover:bg-primary/8 hover:text-primary"
                            onClick={() => onPreview?.(row.original)}
                            title={t("preview")}
                        >
                            <EyeIcon className="size-4" />
                        </Button>

                        {/* Toggle Publish */}
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className={
                                row.original.isPublished
                                    ? "size-8 rounded-md text-emerald-600 hover:bg-amber-500/10 hover:text-amber-600 dark:text-emerald-400 dark:hover:text-amber-400"
                                    : "size-8 rounded-md text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                            }
                            onClick={() => onTogglePublish(row.original.id)}
                            title={row.original.isPublished ? t("unpublish") : t("publish")}
                        >
                            <Rocket className="size-4" />
                        </Button>

                        {/* More actions */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" size="icon-sm" className="size-8 rounded-md text-muted-foreground hover:bg-muted" />
                                }
                            >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">{t("moreActions")}</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-border/40">
                                <DropdownMenuItem
                                    render={<Link href={`/learning-paths/${row.original.id}`} />}
                                    className="text-xs font-semibold"
                                >
                                    <Pencil data-icon="inline-start" className="size-3.5" />
                                    {t("edit")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete(row.original.id)}
                                    variant="destructive"
                                    className="text-xs font-semibold"
                                >
                                    <Trash2 data-icon="inline-start" className="size-3.5" />
                                    {t("delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
                enableSorting: false,
            },
        ],
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        state: { rowSelection },
    });

    if (isLoading) {
        return (
            <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_14px_40px_-32px_oklch(0.42_0.12_240/0.35)]">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <TableHead key={i}>
                                    <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="relative flex flex-col items-center overflow-hidden rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl border border-primary/15 bg-primary/7 text-primary">
                    <Globe className="size-6" />
                </div>
                <p className="text-base font-bold text-foreground">{t("noLearningPathsFound")}</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
                    {t("noLearningPathsDesc")}
                </p>
                <div className="mt-5">
                    <Button
                        nativeButton={false}
                        render={<Link href="/learning-paths/create" />}
                        className="rounded-xl font-bold text-xs"
                    >
                        {t("createFirstPath")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_14px_40px_-32px_oklch(0.42_0.12_240/0.35)]">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id} className="hover:bg-transparent">
                            {hg.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={selectedIds.includes(row.original.id) ? "selected" : undefined}
                            className="group cursor-pointer outline-none focus-visible:bg-primary/[0.045] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/25"
                            tabIndex={0}
                            onClick={() => router.push(`/learning-paths/${row.original.id}`)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    router.push(`/learning-paths/${row.original.id}`);
                                }
                            }}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    onClick={
                                        cell.column.id === "select" || cell.column.id === "actions"
                                            ? (e) => e.stopPropagation()
                                            : undefined
                                    }
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
