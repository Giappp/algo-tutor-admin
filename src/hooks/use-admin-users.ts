"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {queryKeys} from "@/api/query-keys";
import {adminUserService} from "@/api/services/admin-user-services";
import {PageResponse} from "@/types/shared";
import {
    AdminUser,
    AdminUserListParams,
    AdminUserRole,
    CreateAdminUserRequest,
} from "@/types/admin-user";

function useUpdateAdminUserCache() {
    const queryClient = useQueryClient();

    return (updatedUser: AdminUser) => {
        queryClient.setQueriesData<PageResponse<AdminUser>>(
            {queryKey: queryKeys.adminUsers.all},
            (current) => current
                ? {
                    ...current,
                    data: current.data.map((user) =>
                        user.id === updatedUser.id ? updatedUser : user
                    ),
                }
                : current
        );
    };
}

export function useAdminUsers(params?: AdminUserListParams) {
    return useQuery({
        queryKey: queryKeys.adminUsers.list(params),
        queryFn: () => adminUserService.list(params),
        placeholderData: (previousData) => previousData,
    });
}

export function useCreateAdminUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAdminUserRequest) => adminUserService.create(data),
        onSuccess: () => {
            toast.success("User created successfully");
            queryClient.invalidateQueries({queryKey: queryKeys.adminUsers.all});
        },
    });
}

export function useBlockAdminUser() {
    const updateCache = useUpdateAdminUserCache();

    return useMutation({
        mutationFn: ({id, reason}: {id: string; reason: string}) =>
            adminUserService.block(id, reason),
        onSuccess: (user) => {
            updateCache(user);
            toast.success(`${user.username} has been blocked`);
        },
    });
}

export function useUnblockAdminUser() {
    const updateCache = useUpdateAdminUserCache();

    return useMutation({
        mutationFn: (id: string) => adminUserService.unblock(id),
        onSuccess: (user) => {
            updateCache(user);
            toast.success(`${user.username} has been unblocked`);
        },
    });
}

export function useChangeAdminUserRole() {
    const updateCache = useUpdateAdminUserCache();

    return useMutation({
        mutationFn: ({id, role}: {id: string; role: AdminUserRole}) =>
            adminUserService.changeRole(id, role),
        onSuccess: (user) => {
            updateCache(user);
            toast.success(`${user.username}'s role is now ${user.role}`);
        },
    });
}
