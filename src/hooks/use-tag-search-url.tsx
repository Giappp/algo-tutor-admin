"use client"

import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {TagSearch, tagSearchSchema} from "@/schemas/tag-search-schema";

export function useTagSearchUrl() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const rawParams = Object.fromEntries(searchParams.entries());

    const parsed = tagSearchSchema.safeParse(rawParams);

    // Nếu URL hợp lệ thì dùng, nếu không thì lấy giá trị default của Zod
    const params: TagSearch = parsed.success ? parsed.data : tagSearchSchema.parse({});

    // 3. Hàm cập nhật URL cho Next.js
    const updateParams = (newParams: Partial<TagSearch>) => {
        const mergedParams = {...params, ...newParams};

        // Khởi tạo URLSearchParams mới để parse chuỗi query
        const newUrlParams = new URLSearchParams();

        Object.entries(mergedParams).forEach(([key, value]) => {
            // Loại bỏ các giá trị undefined, null, hoặc chuỗi rỗng cho URL sạch
            if (value !== undefined && value !== null && value !== '') {
                newUrlParams.set(key, String(value));
            }
        });

        // Push URL mới vào history.
        // Dùng { scroll: false } để tránh việc Next.js tự động cuộn lên đầu trang khi update search
        router.push(`${pathname}?${newUrlParams.toString()}`, {scroll: false});

        // Lưu ý: Nếu bạn không muốn lưu vào lịch sử trình duyệt (nút Back),
        // bạn có thể dùng router.replace(...) thay vì router.push(...)
    };

    return {params, updateParams};
}