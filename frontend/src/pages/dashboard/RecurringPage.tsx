import { useState, useEffect, useCallback } from "react"
import { Heading, Caption } from "@/components/shared/Typography"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { recurringService, RecurringItem, CalendarEvent } from "@/services/recurringService"
import { AddRecurringModal } from "@/components/recurring/AddRecurringModal"
import { RecurringCalendarView } from "@/components/recurring/RecurringCalendarView"
import { PageLoader } from "@/components/feedback/PageLoader"
import { EmptyState } from "@/components/feedback/EmptyState"
import { toast } from "sonner"
import { Plus, Repeat, Play, Pause, XCircle, SkipForward, Calendar as CalendarIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function RecurringPage() {
  const [plans, setPlans] = useState<RecurringItem[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [list, calEvents] = await Promise.all([
        recurringService.getRecurringTransactions(),
        recurringService.getCalendarEvents(),
      ])
      setPlans(list)
      setEvents(calEvents)
    } catch (error) {
      toast.error("Failed to load recurring transaction plans")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePause = async (id: string) => {
    try {
      await recurringService.pauseRecurring(id)
      toast.success("Recurring plan paused")
      fetchData()
    } catch (error) {
      toast.error("Failed to pause plan")
    }
  }

  const handleResume = async (id: string) => {
    try {
      await recurringService.resumeRecurring(id)
      toast.success("Recurring plan resumed")
      fetchData()
    } catch (error) {
      toast.error("Failed to resume plan")
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await recurringService.cancelRecurring(id)
      toast.success("Recurring plan cancelled")
      fetchData()
    } catch (error) {
      toast.error("Failed to cancel plan")
    }
  }

  const handleSkip = async (id: string) => {
    try {
      await recurringService.skipNextRecurring(id)
      toast.success("Next occurrence skipped!")
      fetchData()
    } catch (error) {
      toast.error("Failed to skip occurrence")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading className="text-3xl">Recurring & Subscriptions</Heading>
          <Caption>Automate recurring bills, rent, subscriptions, and salary schedule.</Caption>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Recurring Plan
        </Button>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Calendar Section (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <RecurringCalendarView events={events} />
          </div>

          {/* Active Plans List (1 Column) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <span>Active Schedules ({plans.length})</span>
            </h3>

            {plans.length === 0 ? (
              <EmptyState
                icon={Repeat}
                title="No recurring plans"
                description="Set up automatic rules for recurring expenses or salary deposits."
                actionLabel="Create First Plan"
                onAction={() => setIsAddOpen(true)}
              />
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                {plans.map((p) => {
                  const isActive = p.status === "active"
                  const isPaused = p.status === "paused"

                  return (
                    <Card key={p._id} className="p-4 space-y-3 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm flex items-center gap-2">
                            {p.title}
                            <Badge variant={p.type === "income" ? "secondary" : "outline"} className="text-[10px] capitalize">
                              {p.type}
                            </Badge>
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {p.category} • {p.frequency}
                          </p>
                        </div>
                        <span
                          className={`text-base font-extrabold ${
                            p.type === "income" ? "text-emerald-500" : "text-foreground"
                          }`}
                        >
                          {formatCurrency(p.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5" /> Next: {new Date(p.nextExecutionDate).toLocaleDateString()}
                        </span>
                        <Badge
                          variant={isActive ? "outline" : "secondary"}
                          className={`text-[10px] uppercase font-semibold ${
                            isActive ? "border-emerald-500 text-emerald-500" : ""
                          }`}
                        >
                          {p.status}
                        </Badge>
                      </div>

                      {/* Control Actions */}
                      <div className="flex items-center justify-end gap-1.5 pt-1 border-t">
                        {isActive && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => handleSkip(p._id)}>
                              <SkipForward className="mr-1 h-3 w-3" /> Skip Next
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handlePause(p._id)}>
                              <Pause className="mr-1 h-3 w-3" /> Pause
                            </Button>
                          </>
                        )}
                        {isPaused && (
                          <Button size="sm" variant="secondary" className="h-7 px-2 text-xs" onClick={() => handleResume(p._id)}>
                            <Play className="mr-1 h-3 w-3 text-emerald-500" /> Resume
                          </Button>
                        )}
                        {p.status !== "cancelled" && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive" onClick={() => handleCancel(p._id)}>
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      <AddRecurringModal open={isAddOpen} onOpenChange={setIsAddOpen} onSuccess={fetchData} />
    </div>
  )
}
