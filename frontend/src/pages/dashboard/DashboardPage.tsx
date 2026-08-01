import { useState, useEffect, useCallback } from "react"
import { StatCard } from "@/components/cards/StatCard"
import { TransactionCard } from "@/components/cards/TransactionCard"
import { ChartContainer } from "@/components/charts/ChartContainer"
import { Heading, Caption, Subheading } from "@/components/shared/Typography"
import { DollarSign, CreditCard, TrendingUp, Wallet, ArrowUpRight, PlusCircle, MinusCircle, ArrowRightLeft, FileText, PieChart, RefreshCw, Sparkles } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { transactionService, DashboardSummaryData, TransactionItem } from "@/services/transactionService"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"
import { TransactionDetailsModal } from "@/components/transactions/TransactionDetailsModal"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export function DashboardPage() {
  const { mongoUser, firebaseUser } = useAuth()
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addType, setAddType] = useState<"income" | "expense" | "transfer">("expense")
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const displayName = mongoUser?.name || firebaseUser?.displayName || "User"

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await transactionService.getDashboardSummary()
      setSummary(data)
    } catch (error) {
      toast.error("Failed to load dashboard metrics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const openAddModal = (type: "income" | "expense" | "transfer") => {
    setAddType(type)
    setIsAddOpen(true)
  }

  const [isPMBreakdownOpen, setIsPMBreakdownOpen] = useState(false)

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-up">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading className="text-3xl">Welcome back, {displayName} 👋</Heading>
          <Caption>
            Here is your financial overview.{" "}
            {summary?.lastUpdated && (
              <span className="text-xs text-muted-foreground">
                (Last updated: {new Date(summary.lastUpdated).toLocaleTimeString()})
              </span>
            )}
          </Caption>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => openAddModal("expense")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Quick Expense
          </Button>
        </div>
      </div>

      {/* AI Coach Today's Insight Widget */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Today's AI Coach Recommendation</h4>
            <p className="text-xs text-muted-foreground">Your cash flow is strong. Consider moving ₹25,000 surplus to your Emergency Reserve.</p>
          </div>
        </div>
        <Button size="sm" asChild className="shrink-0 text-xs">
          <Link to="/ai-coach" className="flex items-center gap-1">
            Open AI Coach <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Button
          variant="secondary"
          className="h-12 flex items-center justify-center gap-2 font-medium"
          onClick={() => openAddModal("expense")}
        >
          <MinusCircle className="h-4 w-4 text-rose-500" /> Add Expense
        </Button>
        <Button
          variant="secondary"
          className="h-12 flex items-center justify-center gap-2 font-medium"
          onClick={() => openAddModal("income")}
        >
          <PlusCircle className="h-4 w-4 text-emerald-500" /> Add Income
        </Button>
        <Button
          variant="secondary"
          className="h-12 flex items-center justify-center gap-2 font-medium"
          onClick={() => openAddModal("transfer")}
        >
          <ArrowRightLeft className="h-4 w-4 text-primary" /> Transfer
        </Button>
        <Button variant="outline" className="h-12 flex items-center justify-center gap-2 font-medium" asChild>
          <Link to="/analytics">
            <PieChart className="h-4 w-4 text-indigo-500" /> Analytics
          </Link>
        </Button>
        <Button variant="outline" className="h-12 flex items-center justify-center gap-2 font-medium" asChild>
          <Link to="/reports">
            <FileText className="h-4 w-4 text-amber-500" /> Reports
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Balance"
          value={formatCurrency(summary?.totalBalance || 0)}
          icon={Wallet}
          trend="up"
          trendValue="Click for breakdown"
          description="net balance"
          onClick={() => setIsPMBreakdownOpen(true)}
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(summary?.monthlyIncome || 0)}
          icon={DollarSign}
          trend="up"
          trendValue="+5.2%"
          description="total earned"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(summary?.monthlyExpenses || 0)}
          icon={CreditCard}
          trend="down"
          trendValue="-1.8%"
          description="total spent"
        />
        <StatCard
          title="Financial Health Score"
          value={`${summary?.financialHealthScore ?? 0}/100`}
          icon={TrendingUp}
          trend="up"
          trendValue="Based on Cash Flow"
          description="based on cashflow"
        />
      </div>

      {/* Weekly Trend Chart & Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-7">
        <ChartContainer
          title="Weekly Spending Trend"
          description="Daily expense pattern across the last 7 days"
          className="col-span-4"
        >
          <LineChart data={summary?.weeklyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ChartContainer>

        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <Subheading className="text-lg">Recent Transactions</Subheading>
            <Button variant="link" size="sm" asChild className="px-0">
              <Link to="/transactions" className="flex items-center gap-1">
                View All <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
              summary.recentTransactions.slice(0, 5).map((tx) => (
                <div
                  key={tx._id}
                  onClick={() => {
                    setSelectedTx(tx)
                    setIsDetailsOpen(true)
                  }}
                  className="cursor-pointer"
                >
                  <TransactionCard
                    id={tx._id}
                    title={tx.title}
                    merchant={tx.merchant || tx.category}
                    amount={tx.type === "income" ? tx.amount : -tx.amount}
                    date={new Date(tx.date).toLocaleDateString()}
                    type={tx.type === "income" ? "income" : "expense"}
                    category={tx.category}
                    status={tx.status}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent transactions.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Spending Categories */}
      {summary?.topCategories && summary.topCategories.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <Subheading className="text-lg font-semibold">Top Spending Categories</Subheading>
          <div className="grid gap-4 md:grid-cols-5">
            {summary.topCategories.map((cat) => (
              <div key={cat.category} className="p-4 rounded-lg bg-muted/40 border space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{cat.category}</p>
                <p className="text-xl font-bold">{formatCurrency(cat.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddTransactionModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        defaultType={addType}
        onSuccess={() => fetchDashboardData()}
      />

      <TransactionDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsOpen => setIsDetailsOpen(setIsOpen)}
        transaction={selectedTx}
      />

      {/* Payment Method Balances Modal */}
      <Dialog open={isPMBreakdownOpen} onOpenChange={setIsPMBreakdownOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Wallet className="h-5 w-5" /> Account & Payment Method Balances
            </DialogTitle>
            <DialogDescription>
              Individual breakdown of current balances across all your registered payment methods.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            {summary?.paymentMethodBreakdown && summary.paymentMethodBreakdown.length > 0 ? (
              summary.paymentMethodBreakdown.map((pm) => (
                <div
                  key={pm._id}
                  className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {pm.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{pm.name}</p>
                      <p className="text-xs text-muted-foreground">{pm.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${pm.balance >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {formatCurrency(pm.balance)}
                    </p>
                    {pm.initialAmount > 0 && (
                      <p className="text-[10px] text-muted-foreground">Initial: {formatCurrency(pm.initialAmount)}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-6">
                No payment methods found. Add one under Settings → Payment Methods.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
