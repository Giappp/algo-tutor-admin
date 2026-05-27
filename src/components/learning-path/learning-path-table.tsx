"use client";

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
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
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Checkbox} from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {LearningPath, Level} from "@/types/learning-path";

const LEVEL_BADGE: Record<Level, { className: string; label: string }> = {
    BEGINNER: {
        className: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
        label: "Beginner",
    },
    INTERMEDIATE: {
        className: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
        label: "Intermediate",
    },
    ADVANCED: {
        className: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20",
        label: "Advanced",
    },
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
    const router = useRouter();
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data,
        columns: [
            {
                id: "select",
                header: ({table: t}) => (
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
                    />
                ),
                cell: ({row}) => (
                    <Checkbox
                        checked={selectedIds.includes(row.original.id)}
                        onCheckedChange={(val) => {
                            row.toggleSelected(val);
                            onSelect?.(row.original.id, val);
                        }}
                        aria-label={`Select ${row.original.name}`}
                    />
                ),
                enableSorting: false,
                size: 40,
            },
            {
                accessorKey: "name",
                header: "Learning Path",
                cell: ({row}) => (
                    <div className="flex flex-col gap-0.5 min-w-[200px]">
                        <span className="font-semibold text-foreground leading-tight">
                            {row.original.name}
                        </span>
                        {row.original.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                                {row.original.description}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "level",
                header: "Level",
                size: 120,
                cell: ({row}) => {
                    const level = LEVEL_BADGE[row.original.level];
                    return (
                        <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${level.className}`}
                        >
                            {level.label}
                        </span>
                    );
                },
            },
            {
                id: "stats",
                header: "Content",
                size: 180,
                cell: ({row}) => (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1" title="Topics">
                            <LayersIcon className="size-3.5"/>
                            {row.original.topicCount}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Published / Total Lessons">
                            <BookOpenIcon className="size-3.5"/>
                            {row.original.publishedLessonCount}/{row.original.totalLessonCount}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Enrollments">
                            <UsersIcon className="size-3.5"/>
                            {row.original.enrollmentCount}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "isPublished",
                header: "Status",
                size: 110,
                cell: ({row}) =>
                    row.original.isPublished ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <GlobeIcon className="mr-1 size-3"/>
                            Published
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="text-muted-foreground">
                            Draft
                        </Badge>
                    ),
            },
            {
                id: "actions",
                header: () => <span className="sr-only">Actions</span>,
                size: 140,
                cell: ({row}) => (
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {/* Preview */}
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 dark:hover:text-blue-400"
                            onClick={() => onPreview?.(row.original)}
                            title="Preview"
                        >
                            <EyeIcon className="size-4"/>
                        </Button>

                        {/* Toggle Publish */}
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className={
                                row.original.isPublished
                                    ? "text-emerald-600 hover:text-amber-600 hover:bg-amber-500/10 dark:text-emerald-400 dark:hover:text-amber-400"
                                    : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                            }
                            onClick={() => onTogglePublish(row.original.id)}
                            title={row.original.isPublished ? "Unpublish" : "Publish"}
                        >
                            <Rocket className="size-4"/>
                        </Button>

                        {/* More actions */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground"/>
                                }
                            >
                                <MoreHorizontal className="size-4"/>
                                <span className="sr-only">More actions</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    render={<Link href={`/dashboard/learning-paths/${row.original.id}`}/>}
                                >
                                    <Pencil data-icon="inline-start"/>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem
                                    onClick={() => onDelete(row.original.id)}
                                    variant="destructive"
                                >
                                    <Trash2 data-icon="inline-start"/>
                                    Delete
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
        state: {rowSelection},
    });

    if (isLoading) {
        return (
            <div className="border rounded-xl overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            {Array.from({length: 6}).map((_, i) => (
                                <TableHead key={i}>
                                    <div className="h-4 w-20 rounded bg-muted animate-pulse"/>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({length: 6}).map((_, j) => (
                                    <TableCell key={j}>
                                        <div className="h-4 w-24 rounded bg-muted animate-pulse"/>
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
            <div className="border rounded-xl p-12 text-center bg-card">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                    <Globe className="size-8 text-muted-foreground"/>
                </div>
                <p className="text-lg font-medium text-foreground">No learning paths found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Get started by creating your first learning path.
                </p>
                <div className="mt-6">
                    <Button
                        nativeButton={false}
                        render={<Link href="/dashboard/learning-paths/create"/>}
                    >
                        Create your first learning path
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-xl overflow-hidden bg-card">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id} className="hover:bg-transparent bg-muted/30">
                            {hg.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    style={{width: header.getSize() !== 150 ? header.getSize() : undefined}}
                                    className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/70 h-10"
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
                            className="cursor-pointer transition-colors hover:bg-muted/50"
                            onClick={() => router.push(`/dashboard/learning-paths/${row.original.id}`)}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    className="py-3"
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
