"use client";

import {useState} from "react";
import Link from "next/link";
import {flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {EyeIcon, Globe, MoreHorizontal, Pencil, Rocket, Trash2} from "lucide-react";
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

const LEVEL_COLORS: Record<Level, string> = {
    BEGINNER: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    INTERMEDIATE: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    ADVANCED: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
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
                header: "Name",
                cell: ({row}) => (
                    <div className="flex flex-col gap-0.5 max-w-xs">
                        <span className="font-medium text-foreground">{row.original.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                            {row.original.description}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "level",
                header: "Level",
                cell: ({row}) => (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            LEVEL_COLORS[row.original.level]
                        }`}
                    >
                        {row.original.level.charAt(0) + row.original.level.slice(1).toLowerCase()}
                    </span>
                ),
            },
            {
                accessorKey: "topicCount",
                header: "Topics",
                cell: ({row}) => (
                    <span className="text-muted-foreground">{row.original.topicCount}</span>
                ),
            },
            {
                accessorKey: "totalLessonCount",
                header: "Lessons",
                cell: ({row}) => (
                    <span className="text-muted-foreground">
                        {row.original.publishedLessonCount}/{row.original.totalLessonCount}
                    </span>
                ),
            },
            {
                accessorKey: "enrollmentCount",
                header: "Enrollments",
                cell: ({row}) => (
                    <span className="text-muted-foreground">{row.original.enrollmentCount}</span>
                ),
            },
            {
                accessorKey: "isPublished",
                header: "Status",
                cell: ({row}) =>
                    row.original.isPublished ? (
                        <Badge variant="default"
                               className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">Published</Badge>
                    ) : (
                        <Badge variant="secondary">Draft</Badge>
                    ),
            },
            {
                id: "actions",
                header: () => null,
                cell: ({row}) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="ghost" size="icon-sm"/>
                            }
                        >
                            <MoreHorizontal data-icon="inline-start"/>
                            <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onPreview?.(row.original)}>
                                <EyeIcon data-icon="inline-start"/>
                                Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                render={
                                    <Link href={`/dashboard/learning-paths/${row.original.id}`}/>
                                }
                            >
                                <Pencil data-icon="inline-start"/>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onTogglePublish(row.original.id)}>
                                <Rocket data-icon="inline-start"/>
                                Toggle Publish
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
                ),
                enableSorting: false,
                size: 60,
            },
        ],
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {rowSelection},
    });

    if (isLoading) {
        return (
            <div className="border rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {table.getHeaderGroups()[0]?.headers.map((header) => (
                                <TableHead key={header.id}>
                                    <div className="h-5 w-24 rounded bg-muted animate-pulse"/>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                {table.getHeaderGroups()[0]?.headers.map((header) => (
                                    <TableCell key={header.id}>
                                        <div className="h-5 w-24 rounded bg-muted animate-pulse"/>
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
            <div className="border rounded-xl p-12 text-center">
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
                        render={
                            <Link href="/dashboard/learning-paths/create"/>
                        }
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
                        <TableRow key={hg.id} className="hover:bg-transparent">
                            {hg.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    style={{width: header.getSize()}}
                                    className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/70"
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
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
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
