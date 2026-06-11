import {getPage, post, put} from "@/api/core/http";
import {
    AdminUser,
    AdminUserListParams,
    AdminUserRole,
    CreateAdminUserRequest,
} from "@/types/admin-user";

export const adminUserService = {
    list: (params?: AdminUserListParams) =>
        getPage<AdminUser>("/api/v1/admin/users", {params}),

    create: (data: CreateAdminUserRequest) =>
        post<AdminUser, CreateAdminUserRequest>("/api/v1/admin/users", data),

    block: (id: string, reason: string) =>
        post<AdminUser, {reason: string}>(`/api/v1/admin/users/${id}/block`, {reason}),

    unblock: (id: string) =>
        post<AdminUser>(`/api/v1/admin/users/${id}/unblock`),

    changeRole: (id: string, role: AdminUserRole) =>
        put<AdminUser, {role: AdminUserRole}>(`/api/v1/admin/users/${id}/role`, {role}),
};
