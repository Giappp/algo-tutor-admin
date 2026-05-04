export type PageResponse<T> = {
    data: T[],
    pageSize: number,
    totalPages: number,
    totalElements: number,
    currentPage: number,
    success?: boolean,
    hasNext: boolean,
    hasPrevious: boolean,
}

export type PaginationMeta = {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
    meta?: PaginationMeta;
}