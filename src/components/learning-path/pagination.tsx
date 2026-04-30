"use client";

import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {PaginationMeta} from "@/types/shared";

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

const PAGE_DISPLAY_COUNT = 5;

export function Pagination({meta, onPageChange, isLoading}: PaginationProps) {
    const {page, size, totalPages, totalElements, hasNext, hasPrevious} = meta;

    const buildPageNumbers = (): (number | "...")[] => {
        if (totalPages <= PAGE_DISPLAY_COUNT) {
            return Array.from({length: totalPages}, (_, i) => i);
        }

        const pages: (number | "...")[] = [];

        if (page < 3) {
            for (let i = 0; i < 4; i++) pages.push(i);
            pages.push("...");
            pages.push(totalPages - 1);
        } else if (page > totalPages - 3) {
            pages.push(0);
            pages.push("...");
            for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
        } else {
            pages.push(0);
            pages.push("...");
            pages.push(page - 1, page, page + 1);
            pages.push("...");
            pages.push(totalPages - 1);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                    {page * size + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                    {Math.min((page + 1) * size, totalElements)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">{totalElements}</span>{" "}
                results
            </p>

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrevious || isLoading}
                    aria-label="Previous page"
                >
                    <ChevronLeftIcon data-icon="inline-start" />
                </Button>

                {buildPageNumbers().map((p, i) =>
                    p === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={p}
                            variant={p === page ? "default" : "ghost"}
                            size="icon-sm"
                            onClick={() => onPageChange(p as number)}
                            disabled={isLoading}
                        >
                            {(p as number) + 1}
                        </Button>
                    )
                )}

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNext || isLoading}
                    aria-label="Next page"
                >
                    <ChevronRightIcon data-icon="inline-start" />
                </Button>
            </div>
        </div>
    );
}
