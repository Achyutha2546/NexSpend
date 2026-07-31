import React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  currencySymbol?: string
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, currencySymbol = "₹", ...props }, ref) => {
    return (
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-muted-foreground sm:text-sm">{currencySymbol}</span>
        </div>
        <Input
          type="number"
          step="0.01"
          className={cn("pl-7", className)}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"
