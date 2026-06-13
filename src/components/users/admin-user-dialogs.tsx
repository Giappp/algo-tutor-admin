"use client";

import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {useTranslations} from "next-intl";
import {
    AtSignIcon,
    CheckIcon,
    EyeIcon,
    EyeOffIcon,
    KeyRoundIcon,
    LockKeyholeIcon,
    ShieldCheckIcon,
    UserIcon,
    UsersIcon,
} from "lucide-react";
import {toast} from "sonner";
import {toAppError} from "@/api/core/api-error";
import {
    useBlockAdminUser,
    useChangeAdminUserRole,
    useCreateAdminUser,
} from "@/hooks/use-admin-users";
import {
    ADMIN_USER_ROLES,
    AdminUser,
    AdminUserRole,
    CreateAdminUserRequest,
} from "@/types/admin-user";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Field, FieldError, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,16}$/;
function getValidationMessage(error: unknown, field: string) {
    const value = toAppError(error).validationErrors?.[field];
    return Array.isArray(value) ? value[0] : value;
}

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateAdminUserDialog({open, onOpenChange}: DialogProps) {
    const t = useTranslations("users");
    const mutation = useCreateAdminUser();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        setError,
        setValue,
        watch,
        formState: {errors},
    } = useForm<CreateAdminUserRequest>({
        defaultValues: {role: "USER", enabled: true},
    });
    const password = watch("password") ?? "";
    const selectedRole = watch("role");
    const enabled = watch("enabled");
    const passwordChecks = [
        {label: t("dialog.passwordChecks.length"), valid: password.length >= 8 && password.length <= 16},
        {label: t("dialog.passwordChecks.case"), valid: /[A-Z]/.test(password) && /[a-z]/.test(password)},
        {label: t("dialog.passwordChecks.numberSpecial"), valid: /\d/.test(password) && /[^A-Za-z0-9]/.test(password)},
        {label: t("dialog.passwordChecks.noSpaces"), valid: password.length > 0 && !/\s/.test(password)},
    ];

    useEffect(() => {
        if (!open) {
            reset({role: "USER", enabled: true});
            setShowPassword(false);
        }
    }, [open, reset]);

    const submit = handleSubmit(async (values) => {
        try {
            await mutation.mutateAsync(values);
            onOpenChange(false);
        } catch (error) {
            const appError = toAppError(error);
            const fields: Array<keyof CreateAdminUserRequest> = [
                "username", "email", "password", "confirmPassword", "role", "enabled",
            ];
            let hasFieldError = false;

            fields.forEach((field) => {
                const message = getValidationMessage(error, field);
                if (message) {
                    hasFieldError = true;
                    setError(field, {message});
                }
            });

            if (!hasFieldError) toast.error(appError.message);
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto p-0 sm:max-w-3xl">
                <DialogHeader className="border-b border-border/50 bg-muted/20 px-6 py-5 pr-14">
                    <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                        <UsersIcon className="size-5" />
                    </div>
                    <DialogTitle className="text-lg">{t("dialog.createTitle")}</DialogTitle>
                    <DialogDescription>{t("dialog.createDescription")}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit}>
                    <div className="grid gap-7 px-6 py-6 md:grid-cols-[1.15fr_0.85fr]">
                        <section className="space-y-5" aria-labelledby="credentials-title">
                            <div className="flex items-center gap-3">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <KeyRoundIcon className="size-4" />
                                </div>
                                <div>
                                    <h3 id="credentials-title" className="text-sm font-semibold">{t("dialog.credentialsTitle")}</h3>
                                    <p className="text-xs text-muted-foreground">{t("dialog.credentialsDescription")}</p>
                                </div>
                            </div>

                            <Field data-invalid={!!errors.username}>
                                <FieldLabel htmlFor="create-username">{t("dialog.username")}</FieldLabel>
                                <div className="relative">
                                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="create-username"
                                        autoComplete="off"
                                        aria-invalid={!!errors.username}
                                        placeholder={t("dialog.usernamePlaceholder")}
                                        className="pl-10"
                                        {...register("username", {required: t("validation.usernameRequired")})}
                                    />
                                </div>
                                <FieldError errors={[errors.username]} />
                            </Field>

                            <Field data-invalid={!!errors.email}>
                                <FieldLabel htmlFor="create-email">{t("dialog.email")}</FieldLabel>
                                <div className="relative">
                                    <AtSignIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="create-email"
                                        type="email"
                                        autoComplete="off"
                                        aria-invalid={!!errors.email}
                                        placeholder="name@example.com"
                                        className="pl-10"
                                        {...register("email", {
                                            required: t("validation.emailRequired"),
                                            pattern: {value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("validation.emailInvalid")},
                                        })}
                                    />
                                </div>
                                <FieldError errors={[errors.email]} />
                            </Field>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field data-invalid={!!errors.password}>
                                    <FieldLabel htmlFor="create-password">{t("dialog.password")}</FieldLabel>
                                    <div className="relative">
                                        <LockKeyholeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="create-password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            aria-invalid={!!errors.password}
                                            className="px-10"
                                            {...register("password", {
                                                required: t("validation.passwordRequired"),
                                                pattern: {
                                                    value: PASSWORD_PATTERN,
                                                    message: t("validation.passwordRequirements"),
                                                },
                                            })}
                                        />
                                        <button
                                            type="button"
                                            aria-label={showPassword ? t("dialog.hidePassword") : t("dialog.showPassword")}
                                            onClick={() => setShowPassword((value) => !value)}
                                            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                        </button>
                                    </div>
                                    <FieldError errors={[errors.password]} />
                                </Field>
                                <Field data-invalid={!!errors.confirmPassword}>
                                    <FieldLabel htmlFor="create-confirm-password">{t("dialog.confirmPassword")}</FieldLabel>
                                    <Input
                                        id="create-confirm-password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        aria-invalid={!!errors.confirmPassword}
                                        {...register("confirmPassword", {
                                            required: t("validation.confirmPasswordRequired"),
                                            validate: (value, values) => value === values.password || t("validation.passwordsMismatch"),
                                        })}
                                    />
                                    <FieldError errors={[errors.confirmPassword]} />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-muted/35 p-3 ring-1 ring-border/40" aria-live="polite">
                                {passwordChecks.map((check) => (
                                    <div key={check.label} className={cn("flex items-center gap-2 text-[11px]", check.valid ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                                        <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full border", check.valid ? "border-emerald-500/30 bg-emerald-500/10" : "border-border")}>
                                            {check.valid && <CheckIcon className="size-2.5" />}
                                        </span>
                                        {check.label}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-5 border-t border-border/50 pt-6 md:border-l md:border-t-0 md:pl-7 md:pt-0" aria-labelledby="access-title">
                            <div className="flex items-center gap-3">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <ShieldCheckIcon className="size-4" />
                                </div>
                                <div>
                                    <h3 id="access-title" className="text-sm font-semibold">{t("dialog.accessTitle")}</h3>
                                    <p className="text-xs text-muted-foreground">{t("dialog.accessDescription")}</p>
                                </div>
                            </div>

                            <Field>
                                <FieldLabel>{t("dialog.role")}</FieldLabel>
                                <div className="grid gap-2">
                                    {ADMIN_USER_ROLES.map((role) => {
                                        const active = selectedRole === role;
                                        return (
                                            <button
                                                key={role}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() => setValue("role", role, {shouldDirty: true})}
                                                className={cn(
                                                    "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200",
                                                    active
                                                        ? "border-primary/35 bg-primary/7 shadow-sm ring-2 ring-primary/10"
                                                        : "border-border/60 hover:border-foreground/20 hover:bg-muted/35"
                                                )}
                                            >
                                                <span className={cn("flex size-8 items-center justify-center rounded-lg", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                                    <ShieldCheckIcon className="size-4" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-xs font-semibold">{t(`roles.${role}.label`)}</span>
                                                    <span className="block truncate text-[11px] text-muted-foreground">{t(`roles.${role}.description`)}</span>
                                                </span>
                                                <span className={cn("flex size-4 items-center justify-center rounded-full border", active ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                                                    {active && <CheckIcon className="size-2.5" />}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            <div className={cn("rounded-xl border p-4 transition-colors", enabled ? "border-emerald-500/25 bg-emerald-500/5" : "border-border/60 bg-muted/25")}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <FieldLabel htmlFor="create-enabled">{t("dialog.enableAccount")}</FieldLabel>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            {enabled ? t("dialog.enabledDescription") : t("dialog.disabledDescription")}
                                        </p>
                                    </div>
                                    <Switch
                                        id="create-enabled"
                                        checked={enabled}
                                        onCheckedChange={(checked) => setValue("enabled", checked, {shouldDirty: true})}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                    <DialogFooter className="border-t border-border/50 bg-muted/20 px-6 py-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? t("dialog.creating") : t("createUser")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface UserDialogProps extends DialogProps {
    user: AdminUser | null;
}

export function ChangeAdminUserRoleDialog({open, onOpenChange, user}: UserDialogProps) {
    const t = useTranslations("users");
    const mutation = useChangeAdminUserRole();
    const [selectedRole, setSelectedRole] = useState<AdminUserRole | null>(null);
    const role = selectedRole ?? user?.role ?? "USER";

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) setSelectedRole(null);
        onOpenChange(nextOpen);
    };

    const submit = async () => {
        if (!user) return;
        try {
            await mutation.mutateAsync({id: user.id, role});
            handleOpenChange(false);
        } catch (error) {
            toast.error(toAppError(error).message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("dialog.changeRoleTitle")}</DialogTitle>
                    <DialogDescription>{t("dialog.changeRoleDescription", {username: user?.username ?? ""})}</DialogDescription>
                </DialogHeader>
                <Field>
                    <FieldLabel>{t("dialog.role")}</FieldLabel>
                    <Select value={role} onValueChange={(value) => setSelectedRole(value as AdminUserRole)}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {ADMIN_USER_ROLES.map((item) => (
                                <SelectItem key={item} value={item}>{t(`roles.${item}.label`)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>{t("cancel")}</Button>
                    <Button onClick={submit} disabled={mutation.isPending || role === user?.role}>
                        {mutation.isPending ? t("dialog.updating") : t("dialog.updateRole")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function BlockAdminUserDialog({open, onOpenChange, user}: UserDialogProps) {
    const t = useTranslations("users");
    const mutation = useBlockAdminUser();
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setReason("");
            setError("");
        }
        onOpenChange(nextOpen);
    };

    const submit = async () => {
        if (!user) return;
        if (!reason.trim()) {
            setError(t("validation.blockReasonRequired"));
            return;
        }

        try {
            await mutation.mutateAsync({id: user.id, reason: reason.trim()});
            handleOpenChange(false);
        } catch (requestError) {
            setError(getValidationMessage(requestError, "reason") || toAppError(requestError).message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("dialog.blockTitle")}</DialogTitle>
                    <DialogDescription>
                        {t("dialog.blockDescription", {username: user?.username ?? ""})}
                    </DialogDescription>
                </DialogHeader>
                <Field data-invalid={!!error}>
                    <FieldLabel htmlFor="block-reason">{t("dialog.reason")}</FieldLabel>
                    <Textarea
                        id="block-reason"
                        value={reason}
                        onChange={(event) => {
                            setReason(event.target.value);
                            setError("");
                        }}
                        aria-invalid={!!error}
                        placeholder={t("dialog.reasonPlaceholder")}
                    />
                    <FieldError>{error}</FieldError>
                </Field>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>{t("cancel")}</Button>
                    <Button variant="destructive" onClick={submit} disabled={mutation.isPending}>
                        {mutation.isPending ? t("dialog.blocking") : t("blockUser")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
