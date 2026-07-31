import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/forms/CurrencyInput"
import { goalService, SavingsGoalItem } from "@/services/goalService"
import { toast } from "sonner"
import { Loader2, PartyPopper } from "lucide-react"

interface AddContributionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: SavingsGoalItem | null
  onSuccess?: () => void
}

export function AddContributionModal({ open, onOpenChange, goal, onSuccess }: AddContributionModalProps) {
  const [amount, setAmount] = useState(0)
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!goal) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amount <= 0) {
      toast.error("Please enter a valid amount.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await goalService.addContribution(goal._id, amount, type, notes)
      
      if (res.goal.percentage >= 100) {
        toast.success(`🎉 Congratulations! You completed your goal "${goal.name}"!`, {
          duration: 6000,
          icon: <PartyPopper className="h-5 w-5 text-emerald-500" />,
        })
      } else {
        toast.success(type === "deposit" ? `Added $${amount.toFixed(2)} to ${goal.name}` : `Withdrew $${amount.toFixed(2)}`)
      }

      onSuccess?.()
      onOpenChange(false)
      setAmount(0)
      setNotes("")
    } catch (error: any) {
      toast.error(error.message || "Failed to process contribution.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Transfer Funds: {goal.name}</DialogTitle>
          <DialogDescription>
            Deposit savings toward this target or log a withdrawal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select value={type} onValueChange={(val: any) => setType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deposit">Deposit (+ Savings)</SelectItem>
                <SelectItem value="withdrawal">Withdrawal (- Savings)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <CurrencyInput
              id="amount"
              placeholder="100.00"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Memo</Label>
            <Input
              id="notes"
              placeholder="e.g. Monthly transfer, bonus deposit"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Submit Transfer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
