"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {
    Editorial,
    CreateEditorialRequest,
    UpdateEditorialRequest,
} from "@/types/learning-path";
import {editorialService} from "@/api/services/editorial-services";

export const QUERY_KEYS = {
    editorials: (lessonId: number) => ["editorials", lessonId] as const,
    editorial: (id: number) => ["editorial", id] as const,
};

export function useEditorialsByLesson(lessonId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.editorials(lessonId),
        queryFn: async () => {
            const response = await editorialService.listByLesson(lessonId);
            return response.data;
        },
        enabled: !!lessonId,
    });
}

export function useCreateEditorial(lessonId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEditorialRequest) =>
            editorialService.create(lessonId, data),
        onSuccess: () => {
            toast.success("Editorial created successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.editorials(lessonId)});
        },
    });
}

export function useUpdateEditorial(editorialId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateEditorialRequest) =>
            editorialService.update(editorialId, data),
        onSuccess: () => {
            toast.success("Editorial updated successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.editorial(editorialId)});
        },
    });
}

export function useDeleteEditorial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (editorialId: number) => editorialService.delete(editorialId),
        onSuccess: () => {
            toast.success("Editorial deleted successfully");
            queryClient.invalidateQueries({queryKey: ["editorials"]});
        },
    });
}
