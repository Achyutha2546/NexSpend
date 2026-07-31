import { useState, useEffect, useCallback } from "react"
import { Heading, Caption, Subheading } from "@/components/shared/Typography"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { budgetService, BudgetItem, BudgetSummaryData } from "@/services/budgetService"
import { AddBudgetModal } from "@/components/budgets/AddBudgetModal"
import { ChartContainer } from "@/components/charts/ChartContainer"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { PageLoader } from "@/components/feedback/PageLoader"
import { EmptyState } from "@/components/feedback/EmptyState"
import { toast } from "sonner"
import { Plus, Wallet, AlertTriangle, CheckCircle2, Trash2, Edit3, ShieldAlert } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const [summary, setSummary] = useState<BudgetSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null)

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    try {
      const [list, sum] = await Promise.all([budgetService.getBudgets(), budgetService.getBudgetSummary()])
      setBudgets(list)
      setSummary(sum)

      // Alert for overspending budgets
      sum.overspendingCategories.forEach((cat) => {
        toast.error(`Budget Warning: ${cat.name} exceeded by ${formatCurrency(cat.spent - cat.allocated)}`, {
          icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
        })
      })
    } catch (error) {
      toast.error("Failed to load budget data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const handleDelete = async (id: string) => {
    try {
      await budgetService.deleteBudget(id)
      setBudgets((prev) => prev.filter((b) => b._id !== id))
      toast.success("Budget deleted")
    } catch (error) {
      toast.error("Failed to delete budget")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading className="text-3xl">Budget Planning</Heading>
          <Caption>Set category caps and track your monthly spending limits.</Caption>
        </div>
        <Button
          onClick={() => {
            setEditingBudget(null)
            setIsAddOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Budget Plan
        </Button>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget Allocated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.totalAllocated || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all active limits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-500">{formatCurrency(summary?.totalSpent || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Current period expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">{formatCurrency(summary?.remaining || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Available to spend</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Budget Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.healthScore || 100}/100</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary && summary.healthScore > 80 ? "Healthy cashflow" : "Review limits"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Overspending Alert Banner */}
          {summary?.overspendingCategories && summary.overspendingCategories.length > 0 && (
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Budget Warning Alert</h4>
                <p className="text-xs">
                  You have exceeded your target budget in {summary.overspendingCategories.map((c) => c.name).join(", ")}.
                </p>
              </div>
            </div>
          )}

          {/* Category Comparison Chart */}
          {summary?.categories && summary.categories.length > 0 && (
            <ChartContainer title="Budget vs. Actual Spent" description="Comparison of set budget limits against real expenses">
              <BarChart data={summary.categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                />
                <Bar dataKey="allocated" fill="#6366f1" radius={[4, 4, 0, 0]} name="Allocated" />
                <Bar dataKey="spent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ChartContainer>
          )}

          {/* Budget List Cards */}
          <div className="space-y-4">
            <Subheading className="text-lg">Active Budget Limits</Subheading>
            {budgets.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No active budget limits"
                description="Set monthly spending limits for categories like Food, Transport, and Entertainment."
                actionLabel="Create Budget Plan"
                onAction={() => {
                  setEditingBudget(null)
                  setIsAddOpen(true)
                }}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {budgets.map((b) => {
                  const isOver = b.status === "exceeded"
                  const isWarning = b.status === "warning" || b.status === "critical"

                  return (
                    <Card key={b._id} className="overflow-hidden hover:shadow-md transition-all">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                        <div>
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: b.color }} />
                            {b.name}
                          </CardTitle>
                          <CardDescription className="capitalize">
                            {b.category} • {b.period}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingBudget(b)
                              setIsAddOpen(true)
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(b._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-end text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Spent</p>
                            <p className={`text-lg font-extrabold ${isOver ? "text-destructive" : "text-foreground"}`}>
                              {formatCurrency(b.spent)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Target Cap</p>
                            <p className="text-sm font-semibold">{formatCurrency(b.amount)}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isOver ? "bg-destructive" : isWarning ? "bg-amber-500" : "bg-primary"
                            }`}
                            style={{ width: `${Math.min(b.percentage, 100)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-muted-foreground">{b.percentage}% used</span>
                          {isOver ? (
                            <Badge variant="destructive" className="flex items-center gap-1 text-[10px]">
                              <AlertTriangle className="h-3 w-3" /> Over by {formatCurrency(b.overspend)}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1 text-[10px]">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {formatCurrency(b.remaining)} remaining
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      <AddBudgetModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        initialData={editingBudget}
        onSuccess={fetchBudgets}
      />
    </div>
  )
}
