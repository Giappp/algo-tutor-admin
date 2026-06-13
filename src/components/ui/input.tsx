import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-border bg-card/85 px-3 py-2 text-base shadow-[0_1px_2px_oklch(0.3_0.05_252/0.04)] outline-none transition-[border-color,box-shadow,background-color] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 hover:border-primary/25 hover:bg-card focus-visible:border-primary/65 focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-primary/12 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/25 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 md:text-sm dark:bg-background/60 dark:hover:border-primary/30 dark:focus-visible:border-primary/80 dark:aria-invalid:border-destructive/60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
