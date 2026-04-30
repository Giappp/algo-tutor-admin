"use client";

import { CheckIcon, CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepIndicatorProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Progress bar */}
      <div className="relative">
        <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-muted" />
        <div
          className="absolute inset-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center gap-1.5"
            >
              {/* Step circle */}
              <Button
                variant={isActive ? "default" : isCompleted ? "secondary" : "ghost"}
                size="icon"
                className={cn(
                  "size-8 rounded-full transition-all duration-200",
                  isCompleted && "bg-primary text-primary-foreground",
                  isActive && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
                  isPending && "opacity-50"
                )}
                onClick={() => onStepClick?.(index)}
                disabled={isPending}
                aria-label={`Step ${index + 1}: ${step.label}`}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? (
                  <CheckIcon data-icon="inline-start" className="size-4" />
                ) : isActive ? (
                  <span className="text-sm font-semibold">{index + 1}</span>
                ) : (
                  <CircleIcon data-icon="inline-start" className="size-4" />
                )}
              </Button>

              {/* Step label */}
              <div className="flex flex-col items-center text-center max-w-20">
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    isActive && "text-foreground",
                    isCompleted && "text-foreground",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="hidden text-[10px] text-muted-foreground sm:block">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
