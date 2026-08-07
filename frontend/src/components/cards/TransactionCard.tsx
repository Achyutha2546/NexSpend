import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, ShoppingBag, Coffee, Truck, Zap, Heart, BookOpen, Film, Tag } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface TransactionCardProps {
  id: string
  title: string
  merchant: string
  amount: number
  date: string
  type: "income" | "expense"
  category: string
  status: "completed" | "pending" | "failed"
}

const CATEGORY_ICONS: Record<string, any> = {
  Food: Coffee,
  Transport: Truck,
  Shopping: ShoppingBag,
  Bills: Zap,
  Entertainment: Film,
  Health: Heart,
  Education: BookOpen,
  Others: Tag,
}

export function TransactionCard({
  title,
  merchant,
  amount,
  date,
  type,
  category,
  status
}: TransactionCardProps) {
  const isIncome = type === "income"
  const IconComponent = CATEGORY_ICONS[category] || (isIncome ? ArrowDownRight : ArrowUpRight)

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-800/90 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-hover hover:border-indigo-200 dark:hover:border-indigo-900">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105",
            isIncome 
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" 
              : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
          )}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
              <span className="truncate">{merchant}</span>
              <span>•</span>
              <span className="truncate">{date}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0 max-w-[45%]">
          <div className={cn(
            "text-sm font-extrabold sm:text-base tracking-tight truncate max-w-full",
            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-100"
          )} title={`${isIncome ? "+" : "-"}${formatCurrency(Math.abs(amount))}`}>
            {isIncome ? "+" : "-"}{formatCurrency(Math.abs(amount))}
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full">
              {category}
            </Badge>
            {status === "pending" && (
              <Badge className="text-[10px] uppercase bg-amber-50 text-amber-600 border-amber-200 rounded-full">
                Pending
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
