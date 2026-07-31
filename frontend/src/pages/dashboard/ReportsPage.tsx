import { useState, useEffect, useCallback } from "react"
import { Heading, Caption, Subheading } from "@/components/shared/Typography"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reportService, ExecutiveReportData, ReportHistoryItem } from "@/services/reportService"
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
  FileText,
  Download,
  Printer,
  Star,
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldCheck,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function ReportsPage() {
  const [report, setReport] = useState<ExecutiveReportData | null>(null)
  const [history, setHistory] = useState<ReportHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const [reportType, setReportType] = useState("executive")
  const [dateRange, setDateRange] = useState("this-month")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const [rep, hist] = await Promise.all([
        reportService.generateExecutiveReport({ reportType, range: dateRange }),
        reportService.getHistory(),
      ])
      setReport(rep)
      setHistory(hist)
    } catch (error) {
      toast.error("Failed to generate financial report")
    } finally {
      setLoading(false)
    }
  }, [reportType, dateRange])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleExportCSV = async (type: "transactions" | "budgets" | "goals") => {
    try {
      toast.info(`Exporting ${type} CSV...`)
      await reportService.exportCSV(type)
      toast.success("CSV file downloaded!")
    } catch (error) {
      toast.error("CSV Export failed.")
    }
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      const updated = await reportService.toggleFavorite(id)
      setHistory((prev) => prev.map((item) => (item._id === id ? updated : item)))
      toast.success(updated.isFavorite ? "Added to favorites" : "Removed from favorites")
    } catch (error) {
      toast.error("Failed to update favorite")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-up">
      {/* Header & Quick Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading className="text-3xl">Financial Reporting Engine</Heading>
          <Caption>Generate executive statements, export CSV datasets, and print audit reports.</Caption>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => handleExportCSV("transactions")}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export Transactions CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportCSV("budgets")}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Budgets CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportCSV("goals")}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Goals CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {/* Controls Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive Statement</SelectItem>
                  <SelectItem value="income">Income Statement</SelectItem>
                  <SelectItem value="cashflow">Cash Flow Statement</SelectItem>
                  <SelectItem value="budget">Budget Performance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setIsPreviewOpen(true)}>
              <Printer className="mr-2 h-4 w-4" /> Print / View Statement
            </Button>
          </div>

          {/* Four Financial Statements Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 1. Income Statement */}
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" /> Income Statement
                  </CardTitle>
                  <CardDescription>Revenue vs. Expenditure</CardDescription>
                </div>
                <Badge variant="secondary">Statement 1</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Income</span>
                  <span className="font-bold text-emerald-500">{formatCurrency(report?.incomeStatement.totalIncome || 0)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Expenses</span>
                  <span className="font-bold text-rose-500">{formatCurrency(report?.incomeStatement.totalExpenses || 0)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Net Income / Savings</span>
                  <span className="text-primary">{formatCurrency(report?.incomeStatement.netIncome || 0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* 2. Cash Flow Statement */}
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" /> Cash Flow Statement
                  </CardTitle>
                  <CardDescription>Inflows, Outflows & Balances</CardDescription>
                </div>
                <Badge variant="secondary">Statement 2</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Money In</span>
                  <span className="font-bold text-emerald-500">{formatCurrency(report?.cashFlowStatement.moneyIn || 0)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Money Out</span>
                  <span className="font-bold text-rose-500">{formatCurrency(report?.cashFlowStatement.moneyOut || 0)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Closing Balance</span>
                  <span>{formatCurrency(report?.cashFlowStatement.closingBalance || 0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Budget Statement */}
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-indigo-500" /> Budget Statement
                  </CardTitle>
                  <CardDescription>Target allocations vs actual</CardDescription>
                </div>
                <Badge variant="secondary">Statement 3</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Allocated</span>
                  <span className="font-bold">{formatCurrency(report?.budgetStatement.totalAllocated || 0)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="font-bold text-rose-500">{formatCurrency(report?.budgetStatement.totalSpent || 0)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Efficiency Score</span>
                  <span className="text-emerald-500">{report?.budgetStatement.efficiencyScore}/100</span>
                </div>
              </CardContent>
            </Card>

            {/* 4. Savings Statement */}
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-500" /> Savings Statement
                  </CardTitle>
                  <CardDescription>Goal progress and target reserves</CardDescription>
                </div>
                <Badge variant="secondary">Statement 4</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Saved</span>
                  <span className="font-bold text-emerald-500">{formatCurrency(report?.savingsStatement.totalSaved || 0)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Target Reserve</span>
                  <span className="font-bold">{formatCurrency(report?.savingsStatement.totalTarget || 0)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Completion Rate</span>
                  <span className="text-primary">{report?.savingsStatement.overallPercentage}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Reports History Log */}
          <div className="space-y-4">
            <Subheading className="text-lg">Generated Report History ({history.length})</Subheading>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.generatedAt).toLocaleString()} • {item.fileSize}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleFavorite(item._id)}
                    >
                      <Star className={`h-4 w-4 ${item.isFavorite ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
                    </Button>
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {item.format}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Print-Friendly Statement Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>NexSpend Executive Statement</DialogTitle>
            <DialogDescription>Printable financial summary document</DialogDescription>
          </DialogHeader>

          {report && (
            <div id="printable-statement" className="space-y-6 py-4 text-sm border p-6 rounded-lg bg-card print:border-none print:p-0">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-primary">NexSpend Financial Statement</h2>
                  <p className="text-xs text-muted-foreground">Generated on {new Date(report.generatedAt).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">OFFICIAL REPORT</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/40 rounded space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">Total Revenue / Income</p>
                  <p className="text-lg font-bold text-emerald-500">{formatCurrency(report.incomeStatement.totalIncome)}</p>
                </div>
                <div className="p-3 bg-muted/40 rounded space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">Total Expenses</p>
                  <p className="text-lg font-bold text-rose-500">{formatCurrency(report.incomeStatement.totalExpenses)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm">Top Category Expenses</h4>
                <div className="space-y-1 text-xs">
                  {report.topCategories.map((c) => (
                    <div key={c.category} className="flex justify-between p-2 rounded bg-muted/20">
                      <span>{c.category}</span>
                      <span className="font-semibold">{formatCurrency(c.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 print:hidden">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
                <Button onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" /> Print Document
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
