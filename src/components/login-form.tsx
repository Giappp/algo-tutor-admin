"use client";

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import {AlertCircle, Loader2, LockKeyhole, Sparkles} from "lucide-react"
import Link from "next/link"
import {useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {SignInSchema} from "@/types/auth/schema"
import {LoginCredentials} from "@/types/auth/auth"
import {toAppError} from "@/api/core/api-error"
import {useAuth} from "@/hooks/use-auth-hook"
import {useTranslations} from "next-intl"

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"div">) {
    const t = useTranslations("login");
    const {login, isLoggingIn} = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginCredentials>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginCredentials) => {
        try {
            setServerError(null);
            await login(data);
        } catch (error) {
            const appError = toAppError(error);
            setServerError(appError.message);
        }
    };

    const isSubmitting = isLoggingIn;

    return (
        <div className={cn("flex flex-col gap-8", className)} {...props}>
            {/* ── Branding Header ── */}
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                    <div
                        className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 shadow-lg shadow-blue-600/25">
                        <Sparkles className="w-7 h-7 text-white"/>
                    </div>
                    <div
                        className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 border-2 border-background">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"/>
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        AlgoTutor
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        {t("subtitle")}
                    </p>
                </div>
            </div>

            {/* ── Card with Form ── */}
            <Card className="overflow-hidden border border-blue-100/80 shadow-xl shadow-blue-950/8 dark:border-blue-300/10 dark:shadow-black/25">
                <CardContent className="p-8">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-6"
                    >
                        <FieldGroup className="gap-5">

                            {/* ── Server Error Banner ── */}
                            {serverError && (
                                <div
                                    className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/30 px-4 py-3.5 text-sm text-rose-600 dark:text-rose-400 transition-all duration-200">
                                    <AlertCircle className="size-4 shrink-0"/>
                                    <p>{serverError}</p>
                                </div>
                            )}

                            {/* ── Welcome Text ── */}
                            <div className="text-center pb-2">
                                <h2 className="text-lg font-semibold text-foreground">
                                    {t("welcomeBack")}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t("subtitle")}
                                </p>
                            </div>

                            {/* ── Username Field ── */}
                            <Field className="space-y-2.5">
                                <FieldLabel
                                    htmlFor="userName"
                                    className="text-sm font-medium text-foreground/80"
                                >
                                    {t("username")}
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        id="userName"
                                        type="text"
                                        placeholder={t("usernamePlaceholder")}
                                        className="h-11 px-4"
                                        aria-invalid={!!errors.username}
                                        disabled={isSubmitting}
                                        {...register("username")}
                                    />
                                </div>
                                {errors.username && (
                                    <FieldError className="text-xs">{errors.username.message}</FieldError>
                                )}
                            </Field>

                            {/* ── Password Field ── */}
                            <Field className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <FieldLabel
                                        htmlFor="password"
                                        className="text-sm font-medium text-foreground/80"
                                    >
                                        {t("password")}
                                    </FieldLabel>
                                    <Link
                                        href="#"
                                        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                                    >
                                        {t("forgotPassword")}
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder={t("passwordPlaceholder")}
                                        className="h-11 px-4"
                                        aria-invalid={!!errors.password}
                                        disabled={isSubmitting}
                                        {...register("password")}
                                    />
                                </div>
                                {errors.password && (
                                    <FieldError className="text-xs">{errors.password.message}</FieldError>
                                )}
                            </Field>

                            {/* ── Submit Button ── */}
                            <Field className="pt-2">
                                <Button
                                    type="submit"
                                    className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-700 to-sky-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:from-blue-800 hover:to-sky-700 hover:shadow-blue-600/35 active:scale-[0.99]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="size-4 animate-spin"/>
                                            {t("authenticating")}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <LockKeyhole className="size-4"/>
                                            {t("signIn")}
                                        </span>
                                    )}
                                </Button>
                            </Field>

                            {/* ── Divider ── */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800"/>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-background px-3 text-xs text-muted-foreground">
                                        {t("secureAccess")}
                                    </span>
                                </div>
                            </div>

                            {/* ── Footer Note ── */}
                            <p className="text-center text-xs text-muted-foreground leading-relaxed">
                                {t.rich("termsNotice", {
                                    terms: (chunks) => (
                                        <Link href="#"
                                              className="font-medium text-primary hover:underline">
                                            {chunks}
                                        </Link>
                                    ),
                                    privacy: (chunks) => (
                                        <Link href="#"
                                              className="font-medium text-primary hover:underline">
                                            {chunks}
                                        </Link>
                                    ),
                                })}
                            </p>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>

            {/* ── Security Badge ── */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                    <span>{t("encryptedConnection")}</span>
                </div>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span>{t("socCompliant")}</span>
            </div>
        </div>
    )
}
