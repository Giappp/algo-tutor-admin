"use client";

import { useTranslations } from "next-intl";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@/types/shared";

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

const PAGE_DISPLAY_COUNT = 5;

export function Pagination({ meta, onPageChange, isLoading }: PaginationProps) {
    const t = useTranslations("common");
    const { page, size, totalPages, totalElements, hasNext, hasPrevious } = meta;

    const buildPageNumbers = (): (number | "...")[] => {
        if (totalPages <= PAGE_DISPLAY_COUNT) {
            return Array.from({ length: totalPages }, (_, i) => i);
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
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border/30 bg-muted/10 backdrop-blur-sm">
            <p className="text-xs font-semibold text-muted-foreground">
                {t("showing")}{" "}
                <span className="font-bold font-mono text-foreground select-none">
                    {page * size + 1}
                </span>{" "}
                {t("to")}{" "}
                <span className="font-bold font-mono text-foreground select-none">
                    {Math.min((page + 1) * size, totalElements)}
                </span>{" "}
                {t("of")}{" "}
                <span className="font-bold font-mono text-foreground select-none">{totalElements}</span>{" "}
                {t("results")}
            </p>

            <div className="flex items-center gap-1.5">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrevious || isLoading}
                    aria-label="Previous page"
                    className="size-8 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/20 shadow-sm"
                >
                    <ChevronLeftIcon className="size-3.5" />
                </Button>

                {buildPageNumbers().map((p, i) =>
                    p === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground font-mono text-xs select-none">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={p}
                            variant={p === page ? "default" : "ghost"}
                            size="icon-sm"
                            onClick={() => onPageChange(p as number)}
                            disabled={isLoading}
                            className={`size-8 rounded-lg font-mono text-xs transition-all duration-150 ${
                                p === page
                                    ? "bg-primary text-primary-foreground shadow-sm font-bold border border-primary/20"
                                    : "hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent"
                            }`}
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
                    className="size-8 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/20 shadow-sm"
                >
                    <ChevronRightIcon className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}
