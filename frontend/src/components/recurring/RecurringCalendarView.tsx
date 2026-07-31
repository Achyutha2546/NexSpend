import { useState } from "react"
import { CalendarEvent } from "@/services/recurringService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface RecurringCalendarViewProps {
  events: CalendarEvent[]
}

export function RecurringCalendarView({ events }: RecurringCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((e) => e.date === dateStr)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" /> Recurring Calendar
          </CardTitle>
          <CardDescription>Scheduled bills, subscriptions, and salary payments.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[120px] text-center">{monthName}</span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground border-b pb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-sm">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 p-1 rounded-md bg-muted/20 border opacity-30" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayEvents = getEventsForDay(day)
            const hasEvents = dayEvents.length > 0

            return (
              <div
                key={day}
                onClick={() => hasEvents && setSelectedDateEvents(dayEvents)}
                className={`h-16 p-1 rounded-md border flex flex-col justify-between transition-all ${
                  hasEvents ? "cursor-pointer bg-primary/5 hover:bg-primary/10 border-primary/30" : "bg-card hover:bg-muted/30"
                }`}
              >
                <span className="text-xs font-medium text-muted-foreground">{day}</span>
                {hasEvents && (
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        className={`text-[10px] truncate px-1 py-0.5 rounded font-medium ${
                          evt.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {formatCurrency(evt.amount)} {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-muted-foreground font-bold">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Selected Day Event Details */}
        {selectedDateEvents.length > 0 && (
          <div className="p-4 rounded-lg border bg-muted/30 space-y-3 animate-in fade-in-50">
            <h4 className="text-sm font-semibold flex items-center justify-between">
              <span>Scheduled Items for {selectedDateEvents[0].date}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setSelectedDateEvents([])}>
                Clear
              </Button>
            </h4>
            <div className="space-y-2">
              {selectedDateEvents.map((evt) => (
                <div key={evt.id} className="flex items-center justify-between p-2 rounded bg-card border text-xs">
                  <div>
                    <span className="font-semibold">{evt.title}</span>
                    <span className="text-muted-foreground ml-2">({evt.category})</span>
                  </div>
                  <Badge variant={evt.type === "income" ? "secondary" : "destructive"}>
                    {formatCurrency(evt.amount)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
