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
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Coach", href: "/ai-coach", icon: Sparkles },
  { name: "Productivity", href: "/productivity", icon: Zap },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "Budget", href: "/budget", icon: Wallet },
  { name: "Recurring", href: "/recurring", icon: Repeat },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Notifications", href: "/notifications", icon: Bell },
]

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation()

  return (
    <div className={cn("pb-12 border-r bg-card min-h-screen w-64 flex flex-col", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-2xl font-bold tracking-tight text-primary">
            NexSpend
          </h2>
          <div className="space-y-1 mt-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      <div className="px-3 py-4 mt-auto border-t">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
            location.pathname.startsWith("/settings")
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </div>
  )
}
