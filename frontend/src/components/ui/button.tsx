import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-cms-primary/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-cms-primary text-white shadow-[0_1px_2px_rgba(16,24,40,0.08)] hover:bg-cms-primary-hover",
        outline:
          "border-cms-border bg-white text-cms-body shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-cms-subtle hover:text-cms-ink aria-expanded:bg-cms-subtle aria-expanded:text-cms-ink",
        secondary:
          "bg-cms-subtle text-cms-ink hover:bg-cms-border aria-expanded:bg-cms-border",
        ghost:
          "text-cms-muted hover:bg-cms-subtle hover:text-cms-ink aria-expanded:bg-cms-subtle aria-expanded:text-cms-ink",
        destructive:
          "border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-500/20",
        link: "text-cms-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-2 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 text-[13px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-4",
        icon: "size-9",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
