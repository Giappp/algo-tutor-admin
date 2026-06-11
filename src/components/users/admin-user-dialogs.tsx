"use client";

import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
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
const ROLE_DETAILS: Record<AdminUserRole, {label: string; description: string}> = {
    USER: {label: "User", description: "Standard learning access"},
    EDITOR: {label: "Editor", description: "Can manage learning content"},
    ADMIN: {label: "Admin", description: "Full administrative access"},
};

function getValidationMessage(error: unknown, field: string) {
    const value = toAppError(error).validationErrors?.[field];
    return Array.isArray(value) ? value[0] : value;
}

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateAdminUserDialog({open, onOpenChange}: DialogProps) {
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
        {label: "8-16 characters", valid: password.length >= 8 && password.length <= 16},
        {label: "Upper and lowercase", valid: /[A-Z]/.test(password) && /[a-z]/.test(password)},
        {label: "Number and special character", valid: /\d/.test(password) && /[^A-Za-z0-9]/.test(password)},
        {label: "No spaces", valid: password.length > 0 && !/\s/.test(password)},
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
                    <DialogTitle className="text-lg">Create a new user</DialogTitle>
                    <DialogDescription>Set up sign-in credentials and choose what this account can access.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit}>
                    <div className="grid gap-7 px-6 py-6 md:grid-cols-[1.15fr_0.85fr]">
                        <section className="space-y-5" aria-labelledby="credentials-title">
                            <div className="flex items-center gap-3">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <KeyRoundIcon className="size-4" />
                                </div>
                                <div>
                                    <h3 id="credentials-title" className="text-sm font-semibold">Sign-in credentials</h3>
                                    <p className="text-xs text-muted-foreground">Identity and initial password</p>
                                </div>
                            </div>

                            <Field data-invalid={!!errors.username}>
                                <FieldLabel htmlFor="create-username">Username</FieldLabel>
                                <div className="relative">
                                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="create-username"
                                        autoComplete="off"
                                        aria-invalid={!!errors.username}
                                        placeholder="e.g. minh.nguyen"
                                        className="pl-10"
                                        {...register("username", {required: "Username is required"})}
                                    />
                                </div>
                                <FieldError errors={[errors.username]} />
                            </Field>

                            <Field data-invalid={!!errors.email}>
                                <FieldLabel htmlFor="create-email">Email address</FieldLabel>
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
                                            required: "Email is required",
                                            pattern: {value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address"},
                                        })}
                                    />
                                </div>
                                <FieldError errors={[errors.email]} />
                            </Field>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field data-invalid={!!errors.password}>
                                    <FieldLabel htmlFor="create-password">Password</FieldLabel>
                                    <div className="relative">
                                        <LockKeyholeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="create-password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            aria-invalid={!!errors.password}
                                            className="px-10"
                                            {...register("password", {
                                                required: "Password is required",
                                                pattern: {
                                                    value: PASSWORD_PATTERN,
                                                    message: "Password does not meet all requirements",
                                                },
                                            })}
                                        />
                                        <button
                                            type="button"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword((value) => !value)}
                                            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                        </button>
                                    </div>
                                    <FieldError errors={[errors.password]} />
                                </Field>
                                <Field data-invalid={!!errors.confirmPassword}>
                                    <FieldLabel htmlFor="create-confirm-password">Confirm password</FieldLabel>
                                    <Input
                                        id="create-confirm-password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        aria-invalid={!!errors.confirmPassword}
                                        {...register("confirmPassword", {
                                            required: "Confirm the password",
                                            validate: (value, values) => value === values.password || "Passwords do not match",
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
                                    <h3 id="access-title" className="text-sm font-semibold">Access and status</h3>
                                    <p className="text-xs text-muted-foreground">Choose the account permission level</p>
                                </div>
                            </div>

                            <Field>
                                <FieldLabel>Role</FieldLabel>
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
                                                    <span className="block text-xs font-semibold">{ROLE_DETAILS[role].label}</span>
                                                    <span className="block truncate text-[11px] text-muted-foreground">{ROLE_DETAILS[role].description}</span>
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
                                        <FieldLabel htmlFor="create-enabled">Enable account</FieldLabel>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            {enabled ? "This user can sign in as soon as the account is created." : "Create the account without allowing sign-in yet."}
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Creating..." : "Create user"}
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
                    <DialogTitle>Change role</DialogTitle>
                    <DialogDescription>Update the access level for {user?.username}.</DialogDescription>
                </DialogHeader>
                <Field>
                    <FieldLabel>Role</FieldLabel>
                    <Select value={role} onValueChange={(value) => setSelectedRole(value as AdminUserRole)}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {ADMIN_USER_ROLES.map((item) => (
                                <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                    <Button onClick={submit} disabled={mutation.isPending || role === user?.role}>
                        {mutation.isPending ? "Updating..." : "Update role"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function BlockAdminUserDialog({open, onOpenChange, user}: UserDialogProps) {
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
            setError("A block reason is required");
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
                    <DialogTitle>Block user</DialogTitle>
                    <DialogDescription>
                        {user?.username} will no longer be able to access the platform.
                    </DialogDescription>
                </DialogHeader>
                <Field data-invalid={!!error}>
                    <FieldLabel htmlFor="block-reason">Reason</FieldLabel>
                    <Textarea
                        id="block-reason"
                        value={reason}
                        onChange={(event) => {
                            setReason(event.target.value);
                            setError("");
                        }}
                        aria-invalid={!!error}
                        placeholder="Describe why this account is being blocked..."
                    />
                    <FieldError>{error}</FieldError>
                </Field>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={submit} disabled={mutation.isPending}>
                        {mutation.isPending ? "Blocking..." : "Block user"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
