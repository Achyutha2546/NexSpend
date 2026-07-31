import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { notificationService } from "@/services/notificationService"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const ruleSchema = z.object({
  name: z.string().min(2, "Rule name is required"),
  triggerType: z.enum(["budget_exceeded", "goal_behind", "subscription_renewing", "payment_due"]),
  thresholdValue: z.coerce.number().min(1, "Threshold must be at least 1"),
  action: z.enum(["notify", "email"]),
})

type RuleFormValues = z.infer<typeof ruleSchema>

interface AddAutomationRuleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddAutomationRuleModal({ open, onOpenChange, onSuccess }: AddAutomationRuleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: "",
      triggerType: "budget_exceeded",
      thresholdValue: 80,
      action: "notify",
    },
  })

  const selectedTrigger = watch("triggerType")

  const onSubmit = async (data: RuleFormValues) => {
    setIsSubmitting(true)
    try {
      await notificationService.createAutomationRule(data as any)
      toast.success("Automation rule created!")
      onSuccess?.()
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast.error(error.message || "Failed to create rule.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Create Automation Trigger Rule</DialogTitle>
          <DialogDescription>
            Automatically generate smart reminders based on financial conditions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input id="name" placeholder="e.g. Alert when Dining reaches 80%" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Trigger Event</Label>
            <Select value={selectedTrigger} onValueChange={(val: any) => setValue("triggerType", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Trigger Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budget_exceeded">Budget Percentage Cap Reached</SelectItem>
                <SelectItem value="subscription_renewing">Subscription Renewal Coming Up</SelectItem>
                <SelectItem value="goal_behind">Savings Goal Behind Schedule</SelectItem>
                <SelectItem value="payment_due">Bill Payment Due</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thresholdValue">Threshold Value / Days Lead Time</Label>
            <Input id="thresholdValue" type="number" min="1" {...register("thresholdValue")} />
            <p className="text-[11px] text-muted-foreground">Percentage cap (e.g. 80%) or days notice (e.g. 3 days).</p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Save Automation Rule"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
