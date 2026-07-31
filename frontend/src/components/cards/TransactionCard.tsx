import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
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

  return (
    <Card className="overflow-hidden transition-all hover:bg-muted/50">
      <CardContent className="p-4 sm:p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border",
            isIncome ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
          )}>
            {isIncome ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="truncate text-sm font-semibold sm:text-base">{title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <span className="truncate">{merchant}</span>
              <span>•</span>
              <span className="truncate">{date}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className={cn(
            "text-sm font-bold sm:text-base",
            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
          )}>
            {isIncome ? "+" : "-"}{formatCurrency(Math.abs(amount))}
          </div>
          <div className="flex items-center gap-2 hidden sm:flex">
            <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground">
              {category}
            </Badge>
            {status === "pending" && (
              <Badge variant="secondary" className="text-[10px] uppercase">
                Pending
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
