export type PageResponse<T> = {
    data: T[],
    pageSize: number,
    totalPages: number,
    totalElements: number,
    currentPage: number,
}

export type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
}