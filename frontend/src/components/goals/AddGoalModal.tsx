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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/forms/CurrencyInput"
import { goalService, SavingsGoalItem } from "@/services/goalService"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const goalSchema = z.object({
  name: z.string().min(2, "Goal name is required"),
  targetAmount: z.coerce.number().positive("Target amount must be greater than 0"),
  currentSaved: z.coerce.number().min(0, "Current saved cannot be negative"),
  targetDate: z.string().min(1, "Target date is required"),
  goalType: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  color: z.string().optional(),
  description: z.string().optional(),
})

type GoalFormValues = z.infer<typeof goalSchema>

interface AddGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialData?: SavingsGoalItem | null
}

const GOAL_TYPES = [
  "emergency", "vacation", "home", "vehicle", "education", "wedding", "investment", "retirement", "business", "gadget", "custom"
]

const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4"]

export function AddGoalModal({ open, onOpenChange, onSuccess, initialData }: AddGoalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!initialData

  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          targetAmount: initialData.targetAmount,
          currentSaved: initialData.currentSaved,
          targetDate: new Date(initialData.targetDate).toISOString().split("T")[0],
          goalType: initialData.goalType,
          priority: initialData.priority,
          color: initialData.color || "#10b981",
          description: initialData.description || "",
        }
      : {
          name: "",
          targetAmount: 0,
          currentSaved: 0,
          targetDate: nextYear,
          goalType: "emergency",
          priority: "medium",
          color: "#10b981",
          description: "",
        },
  })

  const selectedType = watch("goalType")
  const selectedPriority = watch("priority")
  const selectedColor = watch("color")

  const onSubmit = async (data: GoalFormValues) => {
    setIsSubmitting(true)
    try {
      if (isEditing && initialData) {
        await goalService.updateGoal(initialData._id, data as any)
        toast.success("Savings goal updated!")
      } else {
        await goalService.createGoal(data as any)
        toast.success("Savings goal created!")
      }
      onSuccess?.()
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast.error(error.message || "Failed to save goal.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Savings Goal" : "Create New Savings Goal"}</DialogTitle>
          <DialogDescription>
            Set targets for Emergency Fund, Vacation, Vehicle, or Custom investments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input id="name" placeholder="e.g. Emergency Reserve, Summer Vacation" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <CurrencyInput
                id="targetAmount"
                placeholder="10000.00"
                value={watch("targetAmount") || ""}
                onChange={(e) => setValue("targetAmount", parseFloat(e.target.value) || 0)}
              />
              {errors.targetAmount && <p className="text-xs text-destructive">{errors.targetAmount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSaved">Starting Balance</Label>
              <CurrencyInput
                id="currentSaved"
                placeholder="0.00"
                value={watch("currentSaved") || ""}
                onChange={(e) => setValue("currentSaved", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Goal Type</Label>
              <Select value={selectedType} onValueChange={(val) => setValue("goalType", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={selectedPriority} onValueChange={(val: any) => setValue("priority", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input id="targetDate" type="date" {...register("targetDate")} />
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Theme Color</Label>
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

          <div className="space-y-2">
            <Label htmlFor="description">Description / Notes</Label>
            <Textarea id="description" placeholder="Optional rationale..." rows={2} {...register("description")} />
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
                "Update Goal"
              ) : (
                "Create Goal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
