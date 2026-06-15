"use client";

import {useEffect, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {
    BanIcon,
    CheckCircleIcon,
    FilterXIcon,
    MoreHorizontalIcon,
    PlusIcon,
    RefreshCwIcon,
    SearchIcon,
    ShieldCheckIcon,
    ShieldIcon,
    UserCheckIcon,
    UserRoundIcon,
    UsersIcon,
    UserXIcon,
    XIcon,
} from "lucide-react";
import {toast} from "sonner";
import {toAppError} from "@/api/core/api-error";
import {
    BlockAdminUserDialog,
    ChangeAdminUserRoleDialog,
    CreateAdminUserDialog,
} from "@/components/users/admin-user-dialogs";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {InputGroup, InputGroupInput} from "@/components/ui/input-group";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Skeleton} from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Pagination} from "@/components/learning-path/pagination";
import {useAdminUsers, useUnblockAdminUser} from "@/hooks/use-admin-users";
import {useAuthStore} from "@/store/authStore";
import {AdminUser, AdminUserRole} from "@/types/admin-user";

const PAGE_SIZE = 10;
const SORT_OPTIONS = [
    {value: "username,asc", labelKey: "sort.usernameAsc"},
    {value: "username,desc", labelKey: "sort.usernameDesc"},
    {value: "email,asc", labelKey: "sort.emailAsc"},
    {value: "enabled,desc", labelKey: "sort.activeFirst"},
    {value: "enabled,asc", labelKey: "sort.blockedFirst"},
] as const;

const ROLE_STYLES: Record<AdminUserRole, string> = {
    ADMIN: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    EDITOR: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    USER: "border-border/60 bg-muted/50 text-muted-foreground",
};

function UserTableSkeleton() {
    return Array.from({length: 6}, (_, index) => (
            <TableRow key={index} className="hover:bg-transparent">
            <TableCell><div className="flex items-center gap-3"><Skeleton className="size-8 rounded-full" /><Skeleton className="h-9 w-44" /></div></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-36" /></TableCell>
            <TableCell><Skeleton className="size-8" /></TableCell>
        </TableRow>
    ));
}

export default function UsersPage() {
    const t = useTranslations("users");
    const currentUsername = useAuthStore((state) => state.username);
    const currentEmail = useAuthStore((state) => state.email);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("username,asc");
    const [page, setPage] = useState(0);
    const [createOpen, setCreateOpen] = useState(false);
    const [roleUser, setRoleUser] = useState<AdminUser | null>(null);
    const [blockUser, setBlockUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(0);
        }, 350);
        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    const params = useMemo(
        () => ({page, size: PAGE_SIZE, sort, ...(search ? {search} : {})}),
        [page, search, sort]
    );
    const usersQuery = useAdminUsers(params);
    const unblockMutation = useUnblockAdminUser();
    const users = usersQuery.data?.data ?? [];
    const stats = {
        total: usersQuery.data?.totalElements ?? 0,
        visible: users.length,
        active: users.filter((user) => user.enabled).length,
        privileged: users.filter((user) => user.role !== "USER").length,
    };
    const activeSortKey = SORT_OPTIONS.find((option) => option.value === sort)?.labelKey;
    const activeSortLabel = activeSortKey ? t(activeSortKey) : sort;

    const isCurrentUser = (user: AdminUser) =>
        user.username === currentUsername || user.email === currentEmail;

    const unblock = async (user: AdminUser) => {
        try {
            await unblockMutation.mutateAsync(user.id);
        } catch (error) {
            toast.error(toAppError(error).message);
        }
    };

    return (
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 stagger-children">
            <div className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[28rem] rounded-full bg-[radial-gradient(circle,oklch(0.62_0.15_225/0.055)_0%,transparent_68%)]" />

            <header className="flex flex-col gap-4 border-b border-border/40 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                        <ShieldCheckIcon className="size-3.5" />
                        {t("administration")}
                    </div>
                    <h1 className="font-heading text-3xl font-extrabold tracking-tight">{t("title")}</h1>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>
                <Button
                    onClick={() => setCreateOpen(true)}
                    className="shrink-0 rounded-xl transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <PlusIcon data-icon="inline-start" />
                    {t("createUser")}
                </Button>
            </header>

            {!usersQuery.isLoading && !usersQuery.isError && (
                <section className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/80 px-5 py-4 shadow-sm backdrop-blur-md" aria-label={t("summary")}>
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:divide-x sm:divide-border/50">
                        {[
                            {label: t("stats.total"), value: stats.total, icon: UsersIcon, color: "text-primary bg-primary/10"},
                            {label: t("stats.visible"), value: stats.visible, icon: UserRoundIcon, color: "text-sky-600 bg-sky-500/10 dark:text-sky-400"},
                            {label: t("stats.active"), value: stats.active, icon: UserCheckIcon, color: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"},
                            {label: t("stats.privileged"), value: stats.privileged, icon: ShieldIcon, color: "text-amber-600 bg-amber-500/10 dark:text-amber-400"},
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3 sm:px-4 first:pl-0">
                                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                                    <item.icon className="size-4" />
                                </div>
                                <div>
                                    <p className="font-mono text-lg font-bold leading-none tabular-nums">{item.value}</p>
                                    <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_14px_40px_-32px_oklch(0.42_0.12_240/0.35)]">
                <div className="flex flex-col gap-3 border-b border-border/70 bg-primary/[0.025] p-3 sm:flex-row sm:items-center sm:p-4">
                    <InputGroup className="w-full rounded-lg border-input bg-card sm:max-w-md">
                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <InputGroupInput
                            aria-label={t("searchLabel")}
                            placeholder={t("searchPlaceholder")}
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            className="pl-9"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                aria-label={t("clearSearch")}
                                onClick={() => setSearchInput("")}
                                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <XIcon className="size-3.5" />
                            </button>
                        )}
                    </InputGroup>
                    <Select
                        value={sort}
                        onValueChange={(value) => {
                            setSort(value as string);
                            setPage(0);
                        }}
                    >
                        <SelectTrigger aria-label={t("sortUsers")} className="w-full border-input bg-card sm:ml-auto sm:w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>{t(option.labelKey)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label={t("refreshUsers")}
                        onClick={() => usersQuery.refetch()}
                        disabled={usersQuery.isFetching}
                        className="shrink-0 bg-card"
                    >
                        <RefreshCwIcon className={usersQuery.isFetching ? "animate-spin" : ""} />
                    </Button>
                </div>

                {(search || sort !== "username,asc") && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/10 px-4 py-2.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t("activeView")}</span>
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearchInput("")}
                                className="inline-flex items-center gap-1.5 rounded-md border border-primary/15 bg-primary/7 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/12"
                            >
                                {t("searchFilter", {search})}
                                <XIcon className="size-3" />
                            </button>
                        )}
                        {sort !== "username,asc" && (
                            <button
                                type="button"
                                onClick={() => setSort("username,asc")}
                                className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                {t("sortFilter", {sort: activeSortLabel})}
                                <XIcon className="size-3" />
                            </button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-7 text-xs text-muted-foreground"
                            onClick={() => {
                                setSearchInput("");
                                setSort("username,asc");
                            }}
                        >
                            <FilterXIcon data-icon="inline-start" />
                            {t("reset")}
                        </Button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>{t("table.account")}</TableHead>
                                <TableHead>{t("table.role")}</TableHead>
                                <TableHead>{t("table.status")}</TableHead>
                                <TableHead>{t("table.note")}</TableHead>
                                <TableHead className="w-12"><span className="sr-only">{t("actions")}</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usersQuery.isLoading ? (
                                <UserTableSkeleton />
                            ) : usersQuery.isError ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                            <UserXIcon className="size-5" />
                                        </div>
                                        <p className="font-medium">{t("loadError")}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">{toAppError(usersQuery.error).message}</p>
                                        <Button className="mt-4" variant="outline" onClick={() => usersQuery.refetch()}>{t("tryAgain")}</Button>
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border/50">
                                            <UserRoundIcon className="size-5" />
                                        </div>
                                        <p className="font-medium">{search ? t("empty.noMatches") : t("empty.noUsers")}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {search ? t("empty.noMatchesDescription") : t("empty.noUsersDescription")}
                                        </p>
                                        {!search && <Button className="mt-4" onClick={() => setCreateOpen(true)}>{t("createUser")}</Button>}
                                    </TableCell>
                                </TableRow>
                            ) : users.map((user) => {
                                const currentUser = isCurrentUser(user);
                                return (
                                    <TableRow key={user.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar size="sm" className="rounded-lg ring-1 ring-border/70">
                                                    <AvatarImage src={user.avatar ?? undefined} alt={t("avatarAlt", {username: user.username})} />
                                                    <AvatarFallback className="rounded-lg bg-primary/8 text-xs font-bold text-primary">{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-semibold transition-colors group-hover:text-primary">{user.username}</span>
                                                        {currentUser && <Badge variant="outline" className="h-4 rounded-sm border-primary/20 bg-primary/5 px-1.5 text-[9px] font-semibold text-primary">{t("you")}</Badge>}
                                                    </div>
                                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`rounded-md py-1 text-[10px] font-semibold ${ROLE_STYLES[user.role]}`}>
                                                {t(`roles.${user.role}.label`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-2 text-xs font-medium">
                                                <span className={`size-1.5 rounded-full ${user.enabled ? "bg-emerald-500 shadow-[0_0_0_3px_oklch(0.7_0.17_155/0.1)]" : "bg-destructive shadow-[0_0_0_3px_oklch(0.55_0.22_27/0.1)]"}`} />
                                                {user.enabled ? t("status.active") : t("status.blocked")}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-64 truncate text-xs text-muted-foreground" title={user.blockReason ?? undefined}>
                                            {user.blockReason || <span className="text-muted-foreground/45">{t("noRestrictions")}</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={<Button variant="ghost" className="size-8 rounded-md p-0 text-muted-foreground opacity-60 transition-opacity hover:bg-primary/8 hover:text-primary group-hover:opacity-100 group-focus-within:opacity-100" />}>
                                                    <MoreHorizontalIcon />
                                                    <span className="sr-only">{t("actionsFor", {username: user.username})}</span>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-border/50">
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuLabel className="text-xs">{t("manageUser", {username: user.username})}</DropdownMenuLabel>
                                                        <DropdownMenuItem disabled={currentUser} onClick={() => setRoleUser(user)}>
                                                            <ShieldIcon data-icon="inline-start" />
                                                            {t("changeRole")}
                                                        </DropdownMenuItem>
                                                        {user.enabled ? (
                                                            <DropdownMenuItem
                                                                disabled={currentUser}
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => setBlockUser(user)}
                                                            >
                                                                <BanIcon data-icon="inline-start" />
                                                                {t("blockUser")}
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => unblock(user)}>
                                                                <CheckCircleIcon data-icon="inline-start" />
                                                                {t("unblockUser")}
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                {usersQuery.data && (
                    <Pagination
                        meta={{
                            page: usersQuery.data.currentPage,
                            size: usersQuery.data.pageSize,
                            totalElements: usersQuery.data.totalElements,
                            totalPages: usersQuery.data.totalPages,
                            hasNext: usersQuery.data.hasNext,
                            hasPrevious: usersQuery.data.hasPrevious,
                        }}
                        onPageChange={setPage}
                        isLoading={usersQuery.isFetching}
                    />
                )}
            </section>

            <CreateAdminUserDialog open={createOpen} onOpenChange={setCreateOpen} />
            <ChangeAdminUserRoleDialog open={!!roleUser} onOpenChange={(open) => !open && setRoleUser(null)} user={roleUser} />
            <BlockAdminUserDialog open={!!blockUser} onOpenChange={(open) => !open && setBlockUser(null)} user={blockUser} />
        </div>
    );
}
