import React from "react";
import {DashboardShell} from "@/components/dashboard-shell";
import {AdminAuthGuard} from "@/components/admin-auth-guard";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <AdminAuthGuard>
            <DashboardShell>{children}</DashboardShell>
        </AdminAuthGuard>
    );
}
export default Layout
