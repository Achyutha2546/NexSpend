import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/navigation/Sidebar"
import { TopNav } from "@/components/navigation/TopNav"
import { cn } from "@/lib/utils"

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - Desktop & Mobile */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block shrink-0",
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopNav onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-slate-50/70 dark:bg-slate-950/70">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
