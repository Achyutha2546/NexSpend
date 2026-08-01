import { useState, useEffect } from "react"
import { Bell, Search, Menu, LogOut, Settings, User, Download, Smartphone } from "lucide-react"
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
    // Check if running as standalone app
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

    // Check if iOS
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full shadow-sm">
      <div className="flex items-center md:hidden">
        <button
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </button>
      </div>

      <div className="flex flex-1 items-center gap-2 md:gap-4 justify-end">
        <div className="w-full flex-1 md:w-auto md:flex-none">
          <div className="relative max-w-sm ml-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="flex h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8 md:w-[260px] lg:w-[300px]"
            />
          </div>
        </div>

        {/* Top Corner PWA Install Button */}
        {!isStandalone && (
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="h-9 px-3 gap-1.5 text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md transition-all animate-pulse"
          >
            <Download className="h-4 w-4" />
            <span>Install App</span>
          </Button>
        )}

        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          <span className="sr-only">Notifications</span>
        </button>

        <ThemeToggle />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative h-9 w-9 rounded-full overflow-hidden border border-primary/20 hover:ring-2 hover:ring-primary/20 transition-all">
              <Avatar className="h-9 w-9">
                <AvatarImage src={photoURL} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* iOS Installation Instructions Modal */}
      <Dialog open={isIOSDialogOpen} onOpenChange={setIsIOSDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Smartphone className="h-5 w-5" /> Install NexSpend on iPhone/iPad
            </DialogTitle>
            <DialogDescription>
              To install NexSpend as a standalone app on your iOS device:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm py-2">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">1</span>
              <p>Tap the <strong>Share button</strong> (square with up arrow) in Safari.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">2</span>
              <p>Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">3</span>
              <p>Tap <strong>Add</strong> in the top right corner.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
