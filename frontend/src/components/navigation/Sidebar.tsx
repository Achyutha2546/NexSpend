import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  CreditCard, 
  PieChart, 
  Wallet, 
  Repeat,
  Target, 
  FileText, 
  Bell,
  Calendar as CalendarIcon,
  Sparkles,
  Zap,
  Settings 
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-indigo-500" },
  { name: "AI Coach", href: "/ai-coach", icon: Sparkles, color: "text-purple-500" },
  { name: "Productivity", href: "/productivity", icon: Zap, color: "text-amber-500" },
  { name: "Transactions", href: "/transactions", icon: CreditCard, color: "text-cyan-500" },
  { name: "Analytics", href: "/analytics", icon: PieChart, color: "text-emerald-500" },
  { name: "Budget", href: "/budget", icon: Wallet, color: "text-violet-500" },
  { name: "Recurring", href: "/recurring", icon: Repeat, color: "text-blue-500" },
  { name: "Goals", href: "/goals", icon: Target, color: "text-rose-500" },
  { name: "Reports", href: "/reports", icon: FileText, color: "text-sky-500" },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon, color: "text-teal-500" },
  { name: "Notifications", href: "/notifications", icon: Bell, color: "text-indigo-400" },
]

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation()

  return (
    <div className={cn("pb-6 bg-card/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 min-h-screen w-64 flex flex-col shadow-soft", className)}>
      <div className="space-y-4 py-6 flex-1">
        <div className="px-4">
          <div className="flex items-center gap-3 px-3 mb-8">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/25">
              N
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                NexSpend
              </h2>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Premium Fintech</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 translate-x-1"
                      : "text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-indigo-600 dark:hover:text-indigo-400"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : item.color)} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      <div className="px-4 py-4 mt-auto border-t border-slate-100 dark:border-slate-800">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
            location.pathname.startsWith("/settings")
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-indigo-600 dark:hover:text-indigo-400"
          )}
        >
          <Settings className={cn("h-5 w-5", location.pathname.startsWith("/settings") ? "text-white" : "text-slate-400")} />
          Settings
        </Link>
      </div>
    </div>
  )
}
