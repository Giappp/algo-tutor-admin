"use client"
import {columns} from "./columns"
import {DataTable} from "./data-table"
import {useAdminTags} from "@/hooks/use-tags";
import {DebouncedInput} from "@/components/shared/debounced-input";
import {useTagSearchUrl} from "@/hooks/use-tag-search-url";
import {Pagination} from "@/components/shared/Pagination";


export default function AdminTagPage() {

    const {params, updateParams} = useTagSearchUrl();


    const {data: response, isLoading} = useAdminTags(params);

    const tags = response?.data || [];
    const totalPages = response?.totalPages || 1;

    const handleSearch = (value: string | number) => {
        updateParams({
            name: String(value),
            page: 1
        });
    };

    const handlePageChange = (newPage: number) => {
        updateParams({page: newPage});
    };
    return (
        <div className="container mx-auto py-10">
            {/* --- Thanh Công Cụ (Toolbar) --- */}
            <div className="flex items-center justify-between">
                <DebouncedInput
                    placeholder="Tìm kiếm tag..."
                    value={params.name || ''}
                    onChange={handleSearch}
                    className="max-w-sm border p-2 rounded"
                />
            </div>
            {isLoading ? (
                <div>Đang tải dữ liệu...</div>
            ) : (
                <DataTable columns={columns} data={tags}/>
            )}
            <Pagination
                currentPage={params.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    )
}