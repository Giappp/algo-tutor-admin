"use client";

import React from "react";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";

interface FormFieldProps {
    label?: React.ReactNode;
    description?: React.ReactNode;
    error?: React.ReactNode;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}

export function FormField({
                              label,
                              description,
                              error,
                              required,
                              children,
                              className,
                          }: FormFieldProps) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {label && (
                <Label className="text-[13px] font-semibold leading-none text-foreground/90">
                    {label}
                    {required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
            )}
            {description && (
                <p className="-mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
            )}
            {children}
            {error && (
                <p className="text-xs text-destructive" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
