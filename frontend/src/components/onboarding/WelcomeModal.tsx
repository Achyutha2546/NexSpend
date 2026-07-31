import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap, Bot } from "lucide-react"

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    const completed = localStorage.getItem("nexspend_onboarding_completed")
    if (!completed) {
      setIsOpen(true)
    }
  }, [])

  const handleFinish = () => {
    localStorage.setItem("nexspend_onboarding_completed", "true")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-lg mb-1">
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            <span>Welcome to NexSpend</span>
          </div>
          <DialogTitle className="text-xl">
            {step === 1 && "Your Next-Gen Financial Companion"}
            {step === 2 && "Meet Your AI Financial Coach"}
            {step === 3 && "Productivity, Streaks & Wellness"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 text-sm space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Complete Financial Control</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Track transactions, monthly budgets, recurring bills, and savings goals in one unified dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-start gap-3">
                <Bot className="h-6 w-6 text-violet-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">AI Financial Advisory</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Evaluate your Financial Health Score, run What-If scenarios, and receive cash flow forecasts powered by OpenAI, Gemini, or Claude.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <Zap className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Habit Streaks & Global Search</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Build financial habits, complete savings challenges, earn achievement badges, and search across your entire account instantly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          {step < 3 ? (
            <Button size="sm" onClick={() => setStep((s) => s + 1)}>
              Next <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleFinish}>
              Get Started <CheckCircle2 className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
