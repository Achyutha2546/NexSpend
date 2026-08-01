import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5",
        destructive: "bg-rose-50 text-rose-600 border border-rose-200/80 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
        outline: "border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300",
        secondary: "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-indigo-600 dark:hover:bg-purple-950/40 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-800",
        ghost: "text-slate-600 dark:text-slate-400 hover:bg-purple-50 hover:text-indigo-600 dark:hover:bg-purple-950/40 dark:hover:text-indigo-400",
        link: "text-indigo-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-xl px-3.5 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
