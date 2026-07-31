import { useState, useEffect, useCallback } from "react"
import { Heading, Caption } from "@/components/shared/Typography"
import { notificationService, CalendarEventItem } from "@/services/notificationService"
import { RecurringCalendarView } from "@/components/recurring/RecurringCalendarView"
import { PageLoader } from "@/components/feedback/PageLoader"
import { toast } from "sonner"

export function CalendarPage() {
  const [events, setEvents] = useState<CalendarEventItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCalendar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await notificationService.getCalendarEvents()
      setEvents(data)
    } catch (error) {
      toast.error("Failed to load financial calendar")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-up">
      <div>
        <Heading className="text-3xl">Financial Calendar & Schedule</Heading>
        <Caption>Integrated calendar feed of upcoming bills, salary, recurring rules, and goal deadlines.</Caption>
      </div>

      {loading ? <PageLoader /> : <RecurringCalendarView events={events as any} />}
    </div>
  )
}
