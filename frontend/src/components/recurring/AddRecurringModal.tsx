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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/forms/CurrencyInput"
import { recurringService } from "@/services/recurringService"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const recurringSchema = z.object({
  title: z.string().min(2, "Title is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense", "transfer"]),
  category: z.string().min(1, "Category is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  merchant: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]),
  infiniteRepeat: z.boolean(),
  repeatCount: z.coerce.number().optional(),
})

type RecurringFormValues = z.infer<typeof recurringSchema>

interface AddRecurringModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddRecurringModal({ open, onOpenChange, onSuccess }: AddRecurringModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      title: "",
      amount: 0,
      type: "expense",
      category: "Subscriptions",
      paymentMethod: "Credit Card",
      merchant: "",
      notes: "",
      startDate: new Date().toISOString().split("T")[0],
      frequency: "monthly",
      infiniteRepeat: true,
      repeatCount: 12,
    },
  })

  const selectedType = watch("type")
  const selectedFrequency = watch("frequency")
  const infiniteRepeat = watch("infiniteRepeat")

  const onSubmit = async (data: RecurringFormValues) => {
    setIsSubmitting(true)
    try {
      await recurringService.createRecurringTransaction(data as any)
      toast.success("Recurring plan created successfully!")
      onSuccess?.()
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast.error(error.message || "Failed to create recurring plan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Up Recurring Payment / Income</DialogTitle>
          <DialogDescription>
            Automate your subscriptions, rent, salary, or EMIs on a schedule.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Plan Title</Label>
              <Input id="title" placeholder="e.g. Netflix Subscription, Apartment Rent" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <CurrencyInput
                id="amount"
                placeholder="15.99"
                value={watch("amount") || ""}
                onChange={(e) => setValue("amount", parseFloat(e.target.value) || 0)}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={(val: any) => setValue("type", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense (Bill/Rent)</SelectItem>
                  <SelectItem value="income">Income (Salary/Dividends)</SelectItem>
                  <SelectItem value="transfer">Transfer (Savings/SIP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input id="category" placeholder="Subscriptions" {...register("category")} />
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={selectedFrequency} onValueChange={(val: any) => setValue("frequency", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">First Execution Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant / Payee</Label>
              <Input id="merchant" placeholder="Netflix, Landlord, etc." {...register("merchant")} />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/40">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Infinite Repeats</Label>
              <p className="text-xs text-muted-foreground">Keep repeating until manually paused or cancelled.</p>
            </div>
            <Switch checked={infiniteRepeat} onCheckedChange={(val) => setValue("infiniteRepeat", val)} />
          </div>

          {!infiniteRepeat && (
            <div className="space-y-2">
              <Label htmlFor="repeatCount">Number of Times to Repeat</Label>
              <Input id="repeatCount" type="number" min="1" {...register("repeatCount")} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional details..." rows={2} {...register("notes")} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...
                </>
              ) : (
                "Create Recurring Plan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
