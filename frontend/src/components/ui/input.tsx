import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-cms-border bg-white px-3 py-1 text-sm text-cms-ink shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[border-color,box-shadow] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-cms-ink placeholder:text-cms-faint focus-visible:border-cms-primary/60 focus-visible:ring-3 focus-visible:ring-cms-primary/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-cms-subtle disabled:text-cms-muted aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
