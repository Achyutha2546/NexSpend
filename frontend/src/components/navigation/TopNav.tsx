import { useState, useEffect } from "react"
import { Bell, Search, Menu, LogOut, Settings, User, Download, Smartphone, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { useAuth } from "@/context/AuthContext"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const { mongoUser, firebaseUser, logout } = useAuth()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOSDialogOpen, setIsIOSDialogOpen] = useState(false)

  useEffect(() => {
    const checkStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone
    setIsStandalone(!!checkStandalone)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        toast.success("NexSpend App installed successfully!")
      }
      setDeferredPrompt(null)
      return
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    if (isIOS) {
      setIsIOSDialogOpen(true)
    } else {
      toast.info("To install on Android: Tap the 3 dots (⋮) in Chrome and select 'Add to Home screen' or 'Install app'.")
    }
  }

  const displayName = mongoUser?.name || firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || "User"
  const email = mongoUser?.email || firebaseUser?.email || ""
  const photoURL = mongoUser?.photoURL || firebaseUser?.photoURL || ""

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 w-full shadow-soft">
      <div className="flex items-center md:hidden">
        <button
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </button>
      </div>

      <div className="flex flex-1 items-center gap-3 md:gap-4 justify-end">
        {/* Search Input */}
        <div className="w-full flex-1 md:w-auto md:flex-none">
          <div className="relative max-w-sm ml-auto">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search transactions, insights..."
              className="flex h-10 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 px-3 py-1 text-sm text-slate-700 dark:text-slate-200 shadow-inner transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 pl-9 md:w-[260px] lg:w-[320px]"
            />
          </div>
        </div>

        {/* Top Corner PWA Install Button */}
        {!isStandalone && (
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="h-9 px-3.5 gap-1.5 text-xs font-bold rounded-xl gradient-primary-btn"
          >
            <Download className="h-4 w-4" />
            <span>Install App</span>
          </Button>
        )}

        {/* Notification Icon */}
        <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900" />
          <span className="sr-only">Notifications</span>
        </button>

        <ThemeToggle />

        {/* Premium Profile Card */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all">
              <Avatar className="h-9 w-9 ring-2 ring-indigo-500/20">
                <AvatarImage src={photoURL} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 rounded-2xl p-2 glass-card shadow-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{email}</p>
                <div className="pt-1 flex items-center gap-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                    <Sparkles className="h-3 w-3 mr-1" /> Premium Member
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer rounded-xl flex items-center px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600">
                <User className="mr-2.5 h-4 w-4 text-indigo-500" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer rounded-xl flex items-center px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600">
                <Settings className="mr-2.5 h-4 w-4 text-purple-500" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-xl flex items-center px-3 py-2 text-sm font-medium text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30">
              <LogOut className="mr-2.5 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* iOS Installation Modal */}
      <Dialog open={isIOSDialogOpen} onOpenChange={setIsIOSDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-600 font-bold">
              <Smartphone className="h-5 w-5" /> Install NexSpend on iOS
            </DialogTitle>
            <DialogDescription>
              To install NexSpend as a standalone app on your iPhone or iPad:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm py-2">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">1</span>
              <p>Tap the <strong>Share button</strong> in Safari.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">2</span>
              <p>Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">3</span>
              <p>Tap <strong>Add</strong> in the top right corner.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
