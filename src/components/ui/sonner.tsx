"use client"

import {useTheme} from "next-themes"
import {Toaster as Sonner, type ToasterProps} from "sonner"
import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from "lucide-react"

const Toaster = ({...props}: ToasterProps) => {
    const {theme = "system"} = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            icons={{
                success: (
                    <CircleCheckIcon className="size-4 text-emerald-500"/>
                ),
                info: (
                    <InfoIcon className="size-4 text-sky-500"/>
                ),
                warning: (
                    <TriangleAlertIcon className="size-4 text-amber-500"/>
                ),
                error: (
                    <OctagonXIcon className="size-4 text-rose-500"/>
                ),
                loading: (
                    <Loader2Icon className="size-4 text-muted-foreground animate-spin"/>
                ),
            }}
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                    "--border-radius": "calc(var(--radius) - 2px)",
                } as React.CSSProperties
            }
            toastOptions={{
                classNames: {
                    toast: "cn-toast group !shadow-lg !shadow-black/5 !border-border",
                    title: "text-sm font-medium",
                    description: "text-xs text-muted-foreground",
                    closeButton: "!bg-background !border-border hover:!bg-muted",
                    actionButton: "!bg-primary !text-primary-foreground",
                    cancelButton: "!bg-muted !text-foreground",
                },
            }}
            {...props}
        />
    )
}

export {Toaster}
