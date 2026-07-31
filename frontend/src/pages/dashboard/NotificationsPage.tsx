import { useState, useEffect, useCallback } from "react"
import { Heading, Caption, Subheading } from "@/components/shared/Typography"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { notificationService, NotificationItem, AutomationRuleItem } from "@/services/notificationService"
import { AddAutomationRuleModal } from "@/components/notifications/AddAutomationRuleModal"
import { PageLoader } from "@/components/feedback/PageLoader"
import { EmptyState } from "@/components/feedback/EmptyState"
import { toast } from "sonner"
import {
  Bell,
  CheckCheck,
  Pin,
  Trash2,
  Plus,
  Search,
  Zap,
  ShieldAlert,
  Info,
  ArrowRight,
} from "lucide-react"
import { Link } from "react-router-dom"

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [rules, setRules] = useState<AutomationRuleItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [search, setSearch] = useState("")

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const [res, rulesData] = await Promise.all([
        notificationService.getNotifications({ type: typeFilter, priority: priorityFilter }),
        notificationService.getAutomationRules(),
      ])
      setNotifications(res.notifications)
      setUnreadCount(res.unreadCount)
      setRules(rulesData)
    } catch (error) {
      toast.error("Failed to load notification center")
    } finally {
      setLoading(false)
    }
  }, [typeFilter, priorityFilter])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      const updated = await notificationService.markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)))
      setUnreadCount((prev) => Math.max(prev - 1, 0))
    } catch (error) {
      toast.error("Failed to mark as read")
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all as read")
    }
  }

  const handleTogglePin = async (id: string) => {
    try {
      const updated = await notificationService.togglePinNotification(id)
      setNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)))
    } catch (error) {
      toast.error("Failed to toggle pin")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      toast.success("Notification deleted")
    } catch (error) {
      toast.error("Failed to delete notification")
    }
  }

  const filteredNotifications = notifications.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading className="text-3xl flex items-center gap-2">
            Notification & Automation Center
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} Unread
              </Badge>
            )}
          </Heading>
          <Caption>Smart alerts, overspending warnings, and custom financial triggers.</Caption>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark All Read
            </Button>
          )}
          <Button onClick={() => setIsRuleModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Trigger Rule
          </Button>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Notifications Feed (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter controls */}
            <div className="flex items-center gap-3 flex-wrap bg-card p-3 rounded-xl border">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="goal">Goal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredNotifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No notifications"
                description="You're all caught up! Automated alerts will appear here when triggered."
              />
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((n) => {
                  const isHigh = n.priority === "high" || n.priority === "critical"

                  return (
                    <Card
                      key={n._id}
                      className={`p-4 transition-all hover:shadow-md ${
                        !n.isRead ? "border-l-4 border-l-primary bg-primary/5" : "bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {isHigh ? (
                            <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                          ) : (
                            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-bold text-sm flex items-center gap-2">
                              {n.title}
                              {n.isPinned && <Pin className="h-3 w-3 fill-primary text-primary" />}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                            <span className="text-[10px] text-muted-foreground mt-2 block">
                              {new Date(n.date).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleTogglePin(n._id)}
                          >
                            <Pin className={`h-3.5 w-3.5 ${n.isPinned ? "fill-primary text-primary" : ""}`} />
                          </Button>

                          {!n.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-emerald-500"
                              onClick={() => handleMarkAsRead(n._id)}
                            >
                              <CheckCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDelete(n._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>

                          {n.actionUrl && (
                            <Link to={n.actionUrl}>
                              <Button variant="outline" size="sm" className="h-7 text-xs ml-1">
                                Action <ArrowRight className="ml-1 h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Active Automation Rules (1 Column) */}
          <div className="space-y-4">
            <Subheading className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Active Automation Triggers
            </Subheading>
            <div className="space-y-3">
              {rules.map((rule) => (
                <Card key={rule._id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">{rule.name}</h4>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {rule.action}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trigger: <span className="capitalize">{rule.triggerType.replace("_", " ")}</span> at{" "}
                    <strong>{rule.thresholdValue}%</strong> threshold.
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <AddAutomationRuleModal
        open={isRuleModalOpen}
        onOpenChange={setIsRuleModalOpen}
        onSuccess={fetchNotifications}
      />
    </div>
  )
}
