import { useState, useEffect, useCallback } from "react"
import { Heading, Caption, Subheading } from "@/components/shared/Typography"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  aiService,
  FinancialHealthScore,
  StructuredRecommendation,
  ForecastResult,
  ScenarioResult,
  LLMResponse,
} from "@/services/aiService"
import { AIChatDrawer } from "@/components/ai/AIChatDrawer"
import { PageLoader } from "@/components/feedback/PageLoader"
import { toast } from "sonner"
import {
  Sparkles,
  RefreshCw,
  MessageSquare,
  Play,
  Zap,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function AICoachPage() {
  const [health, setHealth] = useState<FinancialHealthScore | null>(null)
  const [recs, setRecs] = useState<StructuredRecommendation[]>([])
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [summary, setSummary] = useState<LLMResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // Simulator State
  const [scenarioType, setScenarioType] = useState<"increase_income" | "reduce_spending" | "cancel_subscription">("reduce_spending")
  const [scenarioDelta, setScenarioDelta] = useState(200)
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // Chat Drawer
  const [isChatOpen, setIsChatOpen] = useState(false)

  const fetchAIData = useCallback(async () => {
    setLoading(true)
    try {
      const [h, r, f, s] = await Promise.all([
        aiService.getHealth(),
        aiService.getRecommendations(),
        aiService.getForecast(),
        aiService.getSummary(),
      ])
      setHealth(h)
      setRecs(r)
      setForecast(f)
      setSummary(s)
    } catch (error) {
      toast.error("Failed to load AI Financial Coach data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAIData()
  }, [fetchAIData])

  const handleRunSimulator = async () => {
    setIsSimulating(true)
    try {
      const res = await aiService.runScenario(scenarioType, scenarioDelta)
      setScenarioResult(res)
      toast.success("Simulation calculated!")
    } catch (error) {
      toast.error("Simulation failed.")
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-up">
      {/* Header & Quick Chat Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading className="text-3xl flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> AI Financial Coach
          </Heading>
          <Caption>Personalized financial advice, forecasts, and interactive scenario simulation.</Caption>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAIData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh Insights
          </Button>
          <Button onClick={() => setIsChatOpen(true)}>
            <MessageSquare className="mr-2 h-4 w-4" /> Open AI Chat
          </Button>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {/* Today's AI Insight Banner */}
          {summary && (
            <Card className="border-primary/40 bg-primary/5 p-6 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">Today's Executive AI Insight</h3>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                      {summary.provider} ({summary.model})
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {summary.content}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Financial Health Score Gauge & Forecast KPIs */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Health Score Card */}
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-muted-foreground mb-4">
                  Financial Health Score
                </CardTitle>
                <div className="flex items-center justify-center py-4">
                  <div className="relative h-32 w-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl font-extrabold">{health?.overallHealthScore ?? 0}</span>
                      <span className="text-xs text-muted-foreground block">/ 100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3">
                <div>
                  <span className="text-muted-foreground">Savings Score:</span>
                  <span className="font-bold ml-1">{health?.savingsScore ?? 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget Score:</span>
                  <span className="font-bold ml-1">{health?.budgetScore ?? 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cash Flow:</span>
                  <span className="font-bold ml-1">{health?.cashFlowScore ?? 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Risk Score:</span>
                  <span className="font-bold ml-1">{health?.riskScore ?? 0}</span>
                </div>
              </div>
            </Card>

            {/* Forecast Card */}
            <Card className="p-6 flex flex-col justify-between md:col-span-2">
              <div>
                <CardTitle className="text-base font-semibold text-muted-foreground mb-4">
                  End-of-Month Forecasts
                </CardTitle>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground">Projected Balance</p>
                    <p className="text-2xl font-bold mt-1 text-emerald-500">
                      {formatCurrency(forecast?.endOfMonthBalance || 0)}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground">Projected Expenses</p>
                    <p className="text-2xl font-bold mt-1 text-rose-500">
                      {formatCurrency(forecast?.projectedExpenses || 0)}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground">Est. Goal Completion</p>
                    <p className="text-2xl font-bold mt-1 text-primary">
                      {forecast?.goalCompletionEstimateMonths || 0} Months
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-card text-xs flex items-center justify-between mt-4">
                <span className="text-muted-foreground">Budget Overrun Risk Score:</span>
                <Badge variant={forecast && forecast.budgetRiskScore > 50 ? "destructive" : "secondary"}>
                  {forecast?.budgetRiskScore || 0}% Risk
                </Badge>
              </div>
            </Card>
          </div>

          {/* Structured AI Recommendations */}
          <div className="space-y-4">
            <Subheading className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Actionable AI Recommendations
            </Subheading>
            <div className="grid gap-4 md:grid-cols-3">
              {recs.map((r, index) => (
                <Card key={index} className="p-5 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={r.priority === "high" ? "destructive" : "secondary"} className="text-[10px] uppercase">
                        {r.priority} Priority
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        {Math.round(r.confidence * 100)}% Confidence
                      </span>
                    </div>

                    <h4 className="font-bold text-sm">{r.title}</h4>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                    <p className="text-xs italic text-muted-foreground border-l-2 pl-2 mt-2">{r.reason}</p>
                  </div>

                  <div className="pt-4 border-t mt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-500">+{formatCurrency(r.estimatedImpact)} Impact</span>
                    <Button size="sm" className="h-7 text-xs" onClick={() => toast.success(`Action applied: ${r.action}`)}>
                      {r.action}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Interactive What-If Scenario Simulator */}
          <Card className="p-6 space-y-4 border-amber-500/30 bg-amber-500/5">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="h-5 w-5 text-amber-500" /> Interactive "What-If" Scenario Simulator
              </CardTitle>
              <CardDescription>Simulate financial adjustments to see instant forecast impacts.</CardDescription>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 items-end">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Scenario Type</label>
                <Select value={scenarioType} onValueChange={(val: any) => setScenarioType(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reduce_spending">Cut Category Expense</SelectItem>
                    <SelectItem value="increase_income">Increase Side Income</SelectItem>
                    <SelectItem value="cancel_subscription">Cancel Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold">Monthly Amount Delta (₹)</label>
                <Input
                  type="number"
                  value={scenarioDelta}
                  onChange={(e) => setScenarioDelta(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs"
                />
              </div>

              <Button onClick={handleRunSimulator} disabled={isSimulating} className="h-9 text-xs">
                Run Simulation
              </Button>
            </div>

            {scenarioResult && (
              <div className="p-4 rounded-lg bg-card border space-y-2 animate-in fade-in-50 text-xs">
                <h5 className="font-bold text-sm text-primary">{scenarioResult.scenarioName} Result</h5>
                <p className="text-muted-foreground">{scenarioResult.impactSummary}</p>
                <div className="flex justify-between font-semibold pt-1 border-t">
                  <span>Projected Net Cashflow:</span>
                  <span className="text-emerald-500">{formatCurrency(scenarioResult.projectedNetCashFlow)}</span>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* AI Chat Drawer */}
      <AIChatDrawer open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  )
}
