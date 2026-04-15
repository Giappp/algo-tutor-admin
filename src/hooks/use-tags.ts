import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {del, get, post, put} from "@/api/core/http"; // Giả định bạn đã có put và del ở file http
import {toast} from "sonner";
import {Tag} from "@/types/tag";

export function useAdminTags(keyword?: string) {
    return useQuery<Tag[]>({
        queryKey: ["admin-tags", keyword],
        queryFn: async () => {
            return await get<Tag[]>("/api/v1/admin/tags", {params: keyword});
        }
    });
}

export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (name: string) => post<Tag>("/api/v1/admin/tags", {name}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["admin-tags"]});
            toast.success("Tạo tag thành công!");
        },
        onError: (error) => {
            toast.error("Tạo tag thất bại. Vui lòng thử lại!");
            console.error(error);
        }
    });
}

export function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        // Cần truyền vào id để biết update tag nào, và data mới
        mutationFn: async ({id, name}: { id: number; name: string }) =>
            put<Tag>(`/api/v1/admin/tags/${id}`, {name}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["admin-tags"]});
            toast.success("Cập nhật tag thành công!");
        },
        onError: (error) => {
            toast.error("Cập nhật thất bại.");
            console.error(error);
        }
    });
}

// --- DELETE ---
export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => del<void>(`/api/v1/admin/tags/${id}`),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["admin-tags"]});
            toast.success("Đã xóa tag!");
        },
        onError: (error) => {
            toast.error("Không thể xóa tag này.");
            console.error(error);
        }
    });
}