"use client";

import {ArrowLeftIcon, ArrowRightIcon, LightbulbIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";

interface StepLayoutProps {
    stepNumber: number;
    title: string;
    subtitle?: string;
    helpText?: string;
    children: React.ReactNode;
    onBack?: () => void;
    onNext?: () => void;
    backLabel?: string;
    nextLabel?: string;
    isFirstStep?: boolean;
    isLastStep?: boolean;
    isNextDisabled?: boolean;
    isBackHidden?: boolean;
    className?: string;
}

export function StepLayout({
                               stepNumber,
                               title,
                               subtitle,
                               helpText,
                               children,
                               onBack,
                               onNext,
                               backLabel = "Back",
                               nextLabel = "Continue",
                               isFirstStep = false,
                               isLastStep = false,
                               isNextDisabled = false,
                               isBackHidden = false,
                               className,
                           }: StepLayoutProps) {
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {/* Step Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center justify-center size-5 rounded-md bg-primary/10 text-primary font-bold text-[10px]">
                        {stepNumber}
                    </span>
                    <span>Step {stepNumber} of 3</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
            </div>

            {/* Help callout */}
            {helpText && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                        <LightbulbIcon className="size-4 text-emerald-600 dark:text-emerald-400"/>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80">{helpText}</p>
                </div>
            )}

            {/* Content */}
            <div className="animate-fade-in-up">{children}</div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t pt-4">
                {!isBackHidden && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBack}
                        disabled={isFirstStep}
                        className={cn(isFirstStep && "invisible")}
                    >
                        <ArrowLeftIcon data-icon="inline-start" className="size-4"/>
                        {backLabel}
                    </Button>
                )}
                <div className={cn("flex-1", !isBackHidden && "flex justify-end")}>
                    <Button
                        variant={isLastStep ? "default" : "outline"}
                        size="sm"
                        onClick={onNext}
                        disabled={isNextDisabled}
                        className={cn(
                            isLastStep && "bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90"
                        )}
                    >
                        {isLastStep ? (
                            nextLabel
                        ) : (
                            <>
                                {nextLabel}
                                <ArrowRightIcon data-icon="inline-end" className="size-4"/>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
