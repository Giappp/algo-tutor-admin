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
        <div className={cn("flex flex-col gap-1.5", className)}>
            {label && (
                <Label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
            )}
            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
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
