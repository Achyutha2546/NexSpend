import { useState, useEffect, useCallback } from "react"
import { Heading, Caption, Subheading } from "@/components/shared/Typography"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  analyticsService,
  AnalyticsMetrics,
  CategoryAnalyticsData,
  MerchantAnalyticsData,
  PaymentAnalyticsData,
  SmartInsight,
  MonthlyReportData,
  AchievementItem,
} from "@/services/analyticsService"
import { ChartContainer } from "@/components/charts/ChartContainer"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { PageLoader } from "@/components/feedback/PageLoader"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  TrendingUp,
  Zap,
  Award,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  Trophy,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const COLORS = ["#6366f1", "#10b981", "#ef4444", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"]

export function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [categoryData, setCategoryData] = useState<CategoryAnalyticsData | null>(null)
  const [merchantData, setMerchantData] = useState<MerchantAnalyticsData | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentAnalyticsData | null>(null)
  const [insights, setInsights] = useState<SmartInsight[]>([])
  const [report, setReport] = useState<MonthlyReportData | null>(null)
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [dateRange, setDateRange] = useState("this-month")
  const [isReportOpen, setIsReportOpen] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const [sum, cat, mer, pay, ins, rep, ach] = await Promise.all([
        analyticsService.getSummary({ range: dateRange }),
        analyticsService.getCategoryAnalytics(),
        analyticsService.getMerchantAnalytics(),
        analyticsService.getPaymentAnalytics(),
        analyticsService.getSmartInsights(),
        analyticsService.getMonthlyReport(),
        analyticsService.getAchievements(),
      ])

      setMetrics(sum)
      setCategoryData(cat)
      setMerchantData(mer)
      setPaymentData(pay)
      setInsights(ins)
      setReport(rep)
      setAchievements(ach)
    } catch (error) {
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-up">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading className="text-3xl">Analytics & Financial Intelligence</Heading>
          <Caption>Deep insights, spending forecasts, and category distributions.</Caption>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setIsReportOpen(true)}>
            <FileText className="mr-2 h-4 w-4" /> Monthly Summary
          </Button>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {/* Key Intelligence Metric Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Net Worth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics?.netWorth || 0)}</div>
                <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> +{metrics?.incomeGrowth || 8.5}% growth
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.savingsRate || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">Target: &gt; 20%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expense Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.expenseRatio || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">of monthly income</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Next Month Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-500">{formatCurrency(metrics?.spendingForecast || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Projected expense limit</p>
              </CardContent>
            </Card>
          </div>

          {/* Smart Insights Cards */}
          {insights.length > 0 && (
            <div className="space-y-3">
              <Subheading className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" /> Smart Financial Insights
              </Subheading>
              <div className="grid gap-4 md:grid-cols-3">
                {insights.map((ins, index) => (
                  <Card key={index} className="p-4 border-l-4 border-l-primary hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      {ins.type === "warning" ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      ) : ins.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-bold text-sm">{ins.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{ins.message}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Income vs Expenses Cashflow Area Chart */}
          <ChartContainer title="Cashflow History & Trends" description="Comparative timeline of Income vs. Expenses">
            <AreaChart data={metrics?.cashFlowTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#expenseGrad)" strokeWidth={2} name="Expense" />
            </AreaChart>
          </ChartContainer>

          {/* Category Distribution & Payment Method Visualizations */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Category Pie/Donut Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Spending Distribution</CardTitle>
                <CardDescription>Share of expenses per category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {categoryData?.categories && categoryData.categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData.categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.categories.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No category data recorded yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Merchant Ranking List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Spend Merchants</CardTitle>
                <CardDescription>Most frequented stores & businesses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {merchantData?.ranking && merchantData.ranking.length > 0 ? (
                  merchantData.ranking.slice(0, 5).map((m, idx) => (
                    <div key={m.merchant} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xs text-muted-foreground">#{idx + 1}</span>
                        <div>
                          <p className="font-semibold">{m.merchant}</p>
                          <p className="text-xs text-muted-foreground">{m.count} transaction(s)</p>
                        </div>
                      </div>
                      <span className="font-bold">{formatCurrency(m.totalSpend)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No merchant data yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Method Analytics Section */}
          {paymentData?.distribution && paymentData.distribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method Breakdown</CardTitle>
                <CardDescription>Expense totals by payment channel</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {paymentData.distribution.map((pm) => (
                  <div key={pm.name} className="p-4 rounded-lg bg-muted/30 border space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">{pm.name}</p>
                    <p className="text-xl font-bold">{formatCurrency(pm.value)}</p>
                    <p className="text-[11px] text-muted-foreground">{pm.percentage}% of overall</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Achievements Badges */}
          <div className="space-y-4">
            <Subheading className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Financial Achievements
            </Subheading>
            <div className="grid gap-4 md:grid-cols-5">
              {achievements.map((ach) => (
                <Card key={ach.id} className={`p-4 text-center transition-all ${ach.unlocked ? "border-amber-500/40 bg-amber-500/5" : "opacity-50 bg-muted"}`}>
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-2">
                    <Award className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm">{ach.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">{ach.description}</p>
                  <Badge variant={ach.unlocked ? "secondary" : "outline"} className="mt-3 text-[10px]">
                    {ach.unlocked ? "Unlocked" : "Locked"}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Monthly Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Monthly Summary Report</DialogTitle>
            <DialogDescription>{report?.month} Executive Overview</DialogDescription>
          </DialogHeader>

          {report && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-lg text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Income</p>
                  <p className="font-bold text-emerald-500">{formatCurrency(report.income)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expenses</p>
                  <p className="font-bold text-rose-500">{formatCurrency(report.expenses)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Savings</p>
                  <p className="font-bold text-primary">{formatCurrency(report.savings)}</p>
                </div>
              </div>

              {report.largestExpense && (
                <div className="p-3 rounded-lg border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Single Largest Expense</span>
                  <span className="font-bold">
                    {report.largestExpense.title} ({formatCurrency(report.largestExpense.amount)})
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Smart Recommendations</p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                  {report.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
