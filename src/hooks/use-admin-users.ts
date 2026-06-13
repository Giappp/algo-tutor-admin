"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {useTranslations} from "next-intl";
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
    const t = useTranslations("users");

    return useMutation({
        mutationFn: (data: CreateAdminUserRequest) => adminUserService.create(data),
        onSuccess: () => {
            toast.success(t("toast.created"));
            queryClient.invalidateQueries({queryKey: queryKeys.adminUsers.all});
        },
    });
}

export function useBlockAdminUser() {
    const updateCache = useUpdateAdminUserCache();
    const t = useTranslations("users");

    return useMutation({
        mutationFn: ({id, reason}: {id: string; reason: string}) =>
            adminUserService.block(id, reason),
        onSuccess: (user) => {
            updateCache(user);
            toast.success(t("toast.blocked", {username: user.username}));
        },
    });
}

export function useUnblockAdminUser() {
    const updateCache = useUpdateAdminUserCache();
    const t = useTranslations("users");

    return useMutation({
        mutationFn: (id: string) => adminUserService.unblock(id),
        onSuccess: (user) => {
            updateCache(user);
            toast.success(t("toast.unblocked", {username: user.username}));
        },
    });
}

export function useChangeAdminUserRole() {
    const updateCache = useUpdateAdminUserCache();
    const t = useTranslations("users");

    return useMutation({
        mutationFn: ({id, role}: {id: string; role: AdminUserRole}) =>
            adminUserService.changeRole(id, role),
        onSuccess: (user) => {
            updateCache(user);
            toast.success(t("toast.roleChanged", {
                username: user.username,
                role: t(`roles.${user.role}.label`),
            }));
        },
    });
}
