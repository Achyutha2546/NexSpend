import { useState, useEffect, useCallback } from "react"
import { Heading, Caption, Subheading } from "@/components/shared/Typography"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  productivityService,
  HabitItem,
  ChallengeItem,
  SearchResultItem,
} from "@/services/productivityService"
import { PageLoader } from "@/components/feedback/PageLoader"
import { toast } from "sonner"
import {
  CheckCircle2,
  Flame,
  Trophy,
  Search,
  Zap,
  Award,
  Sparkles,
} from "lucide-react"
import { Link } from "react-router-dom"
import { formatCurrency } from "@/lib/utils"

export function ProductivityPage() {
  const [habits, setHabits] = useState<HabitItem[]>([])
  const [challenges, setChallenges] = useState<ChallengeItem[]>([])
  const [loading, setLoading] = useState(true)

  // Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [h, c] = await Promise.all([
        productivityService.getHabits(),
        productivityService.getChallenges(),
      ])
      setHabits(h)
      setChallenges(c)
    } catch (error) {
      toast.error("Failed to load productivity suite")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = async (val: string) => {
    setSearchQuery(val)
    if (!val.trim()) {
      setSearchResults([])
      return
    }
    try {
      const res = await productivityService.globalSearch(val)
      setSearchResults(res)
    } catch (error) {
      console.error(error)
    }
  }

  const handleHabitCheckIn = async (id: string) => {
    try {
      const updated = await productivityService.checkInHabit(id)
      setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)))
      toast.success(`Streak updated! ${updated.streakCount} day streak 🔥`)
    } catch (error: any) {
      toast.error(error?.message || "Failed to check in habit.")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-up">
      {/* Header & Global Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading className="text-3xl flex items-center gap-2">
            <Zap className="h-7 w-7 text-amber-500" /> Productivity & Habits
          </Heading>
          <Caption>Daily financial check-ins, habit streaks, savings challenges, and achievements.</Caption>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Global Search (Transactions, Goals...)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-11 bg-card border rounded-xl shadow-lg p-2 space-y-1 z-50 animate-in fade-in-50">
              <p className="text-[10px] text-muted-foreground px-2 font-semibold">Search Results:</p>
              {searchResults.map((r, i) => (
                <Link
                  key={i}
                  to={r.url}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-xs transition-colors"
                >
                  <div>
                    <p className="font-bold">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground">{r.subtitle}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px]">
                    {r.type}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {/* Daily Financial Check-In Banner */}
          <Card className="border-amber-500/40 bg-amber-500/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  Daily Check-In Completed <Badge variant="secondary" className="text-[10px]">7 Day Streak 🔥</Badge>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You logged expenses and reviewed your food budget today. Keep up the momentum!
                </p>
              </div>
            </div>
            <Button size="sm" className="shrink-0 text-xs" onClick={() => toast.success("Daily Check-In Confirmed!")}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Complete Check-In
            </Button>
          </Card>

          {/* Habit Tracker & Streaks Section */}
          <div className="space-y-4">
            <Subheading className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500" /> Active Habit Streaks
            </Subheading>
            <div className="grid gap-4 md:grid-cols-3">
              {habits.map((h) => (
                <Card key={h._id} className="p-5 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {h.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Flame className="h-4 w-4 fill-amber-500" /> {h.streakCount} Days
                      </div>
                    </div>
                    <h4 className="font-bold text-sm">{h.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Check in daily to build long-term financial discipline.
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-4 text-xs"
                    onClick={() => handleHabitCheckIn(h._id)}
                  >
                    Check In Today (+1 Day)
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Savings Challenges Section */}
          <div className="space-y-4">
            <Subheading className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Savings Challenges
            </Subheading>
            <div className="grid gap-4 md:grid-cols-2">
              {challenges.map((c) => {
                const percent = Math.min(Math.round((c.currentAmount / c.targetAmount) * 100), 100)

                return (
                  <Card key={c._id} className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm">{c.title}</h4>
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {c.durationDays} Days Left
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{formatCurrency(c.currentAmount)} Saved</span>
                        <span>{formatCurrency(c.targetAmount)} Goal</span>
                      </div>
                      <Progress value={percent} className="h-2" />
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Achievement Center Badges */}
          <div className="space-y-4">
            <Subheading className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-500" /> Achievement Badges
            </Subheading>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 text-center space-y-2 border-emerald-500/40 bg-emerald-500/5">
                <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <h5 className="font-bold text-xs">First Expense</h5>
                <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600">
                  Unlocked
                </Badge>
              </Card>

              <Card className="p-4 text-center space-y-2 border-amber-500/40 bg-amber-500/5">
                <div className="h-10 w-10 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Flame className="h-5 w-5" />
                </div>
                <h5 className="font-bold text-xs">7-Day Streak</h5>
                <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-600">
                  Unlocked
                </Badge>
              </Card>

              <Card className="p-4 text-center space-y-2 opacity-60">
                <div className="h-10 w-10 mx-auto rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                  <Trophy className="h-5 w-5" />
                </div>
                <h5 className="font-bold text-xs">₹100,000 Saved</h5>
                <Badge variant="outline" className="text-[9px]">
                  Locked
                </Badge>
              </Card>

              <Card className="p-4 text-center space-y-2 opacity-60">
                <div className="h-10 w-10 mx-auto rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h5 className="font-bold text-xs">Budget Master</h5>
                <Badge variant="outline" className="text-[9px]">
                  Locked
                </Badge>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
