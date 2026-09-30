import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-lg border border-cms-border bg-white px-3 py-2 text-sm leading-6 text-cms-ink shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[border-color,box-shadow] outline-none placeholder:text-cms-faint focus-visible:border-cms-primary/60 focus-visible:ring-3 focus-visible:ring-cms-primary/15 disabled:cursor-not-allowed disabled:bg-cms-subtle disabled:text-cms-muted aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
