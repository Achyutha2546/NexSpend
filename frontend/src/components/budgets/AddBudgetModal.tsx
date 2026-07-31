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
import { CurrencyInput } from "@/components/forms/CurrencyInput"
import { budgetService, BudgetItem } from "@/services/budgetService"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const budgetSchema = z.object({
  name: z.string().min(2, "Budget name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  period: z.enum(["weekly", "monthly", "yearly", "custom"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  color: z.string().optional(),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

interface AddBudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialData?: BudgetItem | null
}

const CATEGORIES = [
  "Entire Month", "Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Travel", "Subscriptions", "Investments"
]

const COLORS = ["#6366f1", "#10b981", "#ef4444", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"]

export function AddBudgetModal({ open, onOpenChange, onSuccess, initialData }: AddBudgetModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!initialData

  const today = new Date().toISOString().split("T")[0]
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          amount: initialData.amount,
          category: initialData.category,
          period: initialData.period,
          startDate: new Date(initialData.startDate).toISOString().split("T")[0],
          endDate: new Date(initialData.endDate).toISOString().split("T")[0],
          color: initialData.color || "#6366f1",
        }
      : {
          name: "",
          amount: 0,
          category: "Entire Month",
          period: "monthly",
          startDate: today,
          endDate: nextMonth,
          color: "#6366f1",
        },
  })

  const selectedCategory = watch("category")
  const selectedPeriod = watch("period")
  const selectedColor = watch("color")

  const onSubmit = async (data: BudgetFormValues) => {
    setIsSubmitting(true)
    try {
      if (isEditing && initialData) {
        await budgetService.updateBudget(initialData._id, data as any)
        toast.success("Budget updated successfully!")
      } else {
        await budgetService.createBudget(data as any)
        toast.success("Budget created successfully!")
      }
      onSuccess?.()
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast.error(error.message || "Failed to save budget.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Budget" : "Create Budget Plan"}</DialogTitle>
          <DialogDescription>
            Set spending targets for categories or entire months to stay on top of your goals.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name</Label>
            <Input id="name" placeholder="e.g. Monthly Dining Limit" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Budget Amount</Label>
              <CurrencyInput
                id="amount"
                placeholder="500.00"
                value={watch("amount") || ""}
                onChange={(e) => setValue("amount", parseFloat(e.target.value) || 0)}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={(val) => setValue("category", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={selectedPeriod} onValueChange={(val: any) => setValue("period", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Color Identifier</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("color", c)}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    selectedColor === c ? "scale-125 ring-2 ring-primary ring-offset-2" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : isEditing ? (
                "Update Budget"
              ) : (
                "Create Budget"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
