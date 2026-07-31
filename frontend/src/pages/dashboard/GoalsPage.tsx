import { useState, useEffect, useCallback } from "react"
import { Heading, Caption, Subheading } from "@/components/shared/Typography"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { goalService, SavingsGoalItem, GoalSummaryData } from "@/services/goalService"
import { AddGoalModal } from "@/components/goals/AddGoalModal"
import { AddContributionModal } from "@/components/goals/AddContributionModal"
import { PageLoader } from "@/components/feedback/PageLoader"
import { EmptyState } from "@/components/feedback/EmptyState"
import { toast } from "sonner"
import { Plus, Target, CheckCircle2, Trash2, Edit3 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoalItem[]>([])
  const [summary, setSummary] = useState<GoalSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoalItem | null>(null)
  const [contribGoal, setContribGoal] = useState<SavingsGoalItem | null>(null)
  const [isContribOpen, setIsContribOpen] = useState(false)

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    try {
      const [list, sum] = await Promise.all([goalService.getGoals(), goalService.getGoalSummary()])
      setGoals(list)
      setSummary(sum)
    } catch (error) {
      toast.error("Failed to load savings goals")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleDelete = async (id: string) => {
    try {
      await goalService.deleteGoal(id)
      setGoals((prev) => prev.filter((g) => g._id !== id))
      toast.success("Goal deleted")
    } catch (error) {
      toast.error("Failed to delete goal")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading className="text-3xl">Savings Goals & Planning</Heading>
          <Caption>Set long-term targets, track milestones, and automate deposits.</Caption>
        </div>
        <Button
          onClick={() => {
            setEditingGoal(null)
            setIsAddOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Savings Goal
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">{formatCurrency(summary?.totalSaved || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">{summary?.overallPercentage || 0}% of overall target</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(summary?.remainingSavings || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all active goals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.activeCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Goals Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">{summary?.completedCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">100% target reached</p>
              </CardContent>
            </Card>
          </div>

          {/* Goal Cards */}
          <div className="space-y-4">
            <Subheading className="text-lg">Your Goals ({goals.length})</Subheading>
            {goals.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No savings goals created"
                description="Start building your Emergency Reserve, House Downpayment, or Vacation fund."
                actionLabel="Create Savings Goal"
                onAction={() => {
                  setEditingGoal(null)
                  setIsAddOpen(true)
                }}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {goals.map((g) => {
                  const isCompleted = g.status === "completed" || g.percentage >= 100

                  return (
                    <Card key={g._id} className="overflow-hidden hover:shadow-md transition-all">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                        <div>
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: g.color }} />
                            {g.name}
                          </CardTitle>
                          <CardDescription className="capitalize">
                            {g.goalType} • Priority: {g.priority}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingGoal(g)
                              setIsAddOpen(true)
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(g._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-end text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Saved</p>
                            <p className="text-xl font-extrabold text-emerald-500">{formatCurrency(g.currentSaved)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Target</p>
                            <p className="text-sm font-semibold">{formatCurrency(g.targetAmount)}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full transition-all duration-500 bg-emerald-500"
                            style={{ width: `${g.percentage}%` }}
                          />
                        </div>

                        {/* Smart Recommendations */}
                        <div className="p-3 rounded-lg bg-muted/40 text-xs space-y-1">
                          <div className="flex items-center justify-between font-semibold">
                            <span>Recommended Monthly Savings:</span>
                            <span className="text-primary">{formatCurrency(g.monthlyNeeded)}/mo</span>
                          </div>
                          <p className="text-muted-foreground">
                            Target Date: {new Date(g.targetDate).toLocaleDateString()} ({g.probability} Probability)
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          {isCompleted ? (
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Completed Goal!
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {g.percentage}% Reached
                            </Badge>
                          )}

                          {!isCompleted && (
                            <Button
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                setContribGoal(g)
                                setIsContribOpen(true)
                              }}
                            >
                              <Plus className="mr-1 h-3 w-3" /> Deposit / Withdraw
                            </Button>
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

      {/* Modals */}
      <AddGoalModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        initialData={editingGoal}
        onSuccess={fetchGoals}
      />

      <AddContributionModal
        open={isContribOpen}
        onOpenChange={setIsContribOpen}
        goal={contribGoal}
        onSuccess={fetchGoals}
      />
    </div>
  )
}
