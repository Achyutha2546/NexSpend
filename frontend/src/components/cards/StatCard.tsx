import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
  gradient?: "indigo" | "purple" | "emerald" | "cyan" | "default"
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  className,
  gradient = "default",
  onClick,
}: StatCardProps) {
  const gradientStyles = {
    indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20",
    purple: "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20",
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20",
    cyan: "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20",
    default: "glass-card border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100",
  }

  const isGradient = gradient !== "default"

  return (
    <Card
      onClick={onClick}
      className={cn(
        "rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-hover p-1",
        gradientStyles[gradient],
        onClick && "cursor-pointer",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isGradient ? "text-white/80" : "text-slate-500 dark:text-slate-400")}>
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", isGradient ? "bg-white/20 text-white" : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400")}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl lg:text-3xl font-extrabold tracking-tight", isGradient ? "text-white" : "text-slate-800 dark:text-slate-100")}>
          {value}
        </div>
        {(description || trendValue) && (
          <p className="text-xs mt-2 flex items-center gap-1.5 font-medium">
            {trendValue && (
              <span
                className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold",
                  isGradient
                    ? "bg-white/20 text-white"
                    : trend === "up"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : trend === "down"
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {trend === "up" && "↑ "}
                {trend === "down" && "↓ "}
                {trendValue}
              </span>
            )}
            <span className={isGradient ? "text-white/80" : "text-slate-500 dark:text-slate-400"}>
              {description}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
