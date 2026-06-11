export const ADMIN_USER_ROLES = ["USER", "EDITOR", "ADMIN"] as const;

export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number];

export interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: AdminUserRole;
    avatar: string | null;
    enabled: boolean;
    blockReason: string | null;
}

export interface CreateAdminUserRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: AdminUserRole;
    enabled?: boolean;
}

export interface AdminUserListParams {
    search?: string;
    page?: number;
    size?: number;
    sort?: string | string[];
}
