"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Locale, locales } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LanguagesIcon } from "lucide-react";

const localeConfig: Record<Locale, { flag: string; label: string }> = {
    en: { flag: "🇬🇧", label: "English" },
    vi: { flag: "🇻🇳", label: "Tiếng Việt" },
};

export function LocaleSwitcher() {
    const t = useTranslations("settings");
    const locale = useLocale();
    const [isPending, startTransition] = useTransition();

    function onChange(value: string) {
        if (!value) return;
        const newLocale = value as Locale;
        startTransition(async () => {
            await setUserLocale(newLocale);
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        disabled={isPending}
                    />
                }
            >
                <LanguagesIcon className="size-[18px] text-muted-foreground" />
                <span className="sr-only">{t("language")}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="min-w-[160px]">
                <DropdownMenuRadioGroup value={locale} onValueChange={onChange}>
                    {locales.map((loc) => (
                        <DropdownMenuRadioItem key={loc} value={loc}>
                            <span className="text-base leading-none">{localeConfig[loc].flag}</span>
                            <span className="text-sm">{localeConfig[loc].label}</span>
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
