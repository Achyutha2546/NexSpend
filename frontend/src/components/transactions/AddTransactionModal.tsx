import { useState, useEffect } from "react"
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
import { transactionService, TransactionItem } from "@/services/transactionService"
import { categoryService, CategoryItem } from "@/services/categoryService"
import { paymentMethodService, PaymentMethodItem } from "@/services/paymentMethodService"
import { toast } from "sonner"
import { Loader2, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Plus } from "lucide-react"

const transactionSchema = z.object({
  title: z.string().min(2, "Title is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense", "transfer"]),
  category: z.string().min(1, "Category is required"),
  paymentMethod: z.string().min(1, "Payment method / source is required"),
  sourceMethod: z.string().optional(),
  destinationMethod: z.string().optional(),
  merchant: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  recurring: z.boolean(),
  recurringFrequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (newTx: TransactionItem) => void
  defaultType?: "income" | "expense" | "transfer"
  initialData?: TransactionItem | null
}

const EXPENSE_CATEGORIES = [
  "Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Travel", "Subscriptions", "Others"
]

const PM_TYPE_OPTIONS: ("Cash" | "UPI" | "Credit Card" | "Debit Card" | "Bank Account" | "Wallet" | "Other")[] = [
  "Bank Account", "Credit Card", "Debit Card", "UPI", "Cash", "Wallet", "Other"
]

export function AddTransactionModal({
  open,
  onOpenChange,
  onSuccess,
  defaultType = "expense",
  initialData = null,
}: AddTransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customIncomeCategories, setCustomIncomeCategories] = useState<CategoryItem[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([])

  // State for adding income source
  const [showAddSource, setShowAddSource] = useState(false)
  const [newSourceName, setNewSourceName] = useState("")
  const [newSourceInitialAmount, setNewSourceInitialAmount] = useState<number | "">("")
  const [isCreatingSource, setIsCreatingSource] = useState(false)

  // State for adding payment method
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false)
  const [newPMName, setNewPMName] = useState("")
  const [newPMType, setNewPMType] = useState<"Cash" | "UPI" | "Credit Card" | "Debit Card" | "Bank Account" | "Wallet" | "Other">("Bank Account")
  const [newPMInitialAmount, setNewPMInitialAmount] = useState<number | "">("")
  const [isCreatingPM, setIsCreatingPM] = useState(false)

  const isEditing = !!initialData

  const loadData = async () => {
    try {
      const [cats, pms] = await Promise.all([
        categoryService.getCategories(),
        paymentMethodService.getPaymentMethods(),
      ])
      const incomeOnly = cats.filter((c) => c.type === "income")
      setCustomIncomeCategories(incomeOnly)
      setPaymentMethods(pms)
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          amount: initialData.amount,
          type: initialData.type,
          category: initialData.category,
          paymentMethod: initialData.paymentMethod,
          sourceMethod: initialData.sourceMethod || initialData.paymentMethod || "",
          destinationMethod: initialData.destinationMethod || "",
          merchant: initialData.merchant || "",
          notes: initialData.notes || "",
          date: new Date(initialData.date).toISOString().split("T")[0],
          time: initialData.time || "12:00",
          recurring: initialData.recurring || false,
          recurringFrequency: initialData.recurringFrequency || "monthly",
        }
      : {
          title: "",
          amount: 0,
          type: defaultType,
          category: defaultType === "income" ? "" : "Food",
          paymentMethod: "",
          sourceMethod: "",
          destinationMethod: "",
          merchant: "",
          notes: "",
          date: new Date().toISOString().split("T")[0],
          time: new Date().toTimeString().split(" ")[0].slice(0, 5),
          recurring: false,
          recurringFrequency: "monthly",
        },
  })

  const selectedType = watch("type")
  const selectedCategory = watch("category")
  const selectedPaymentMethod = watch("paymentMethod")
  const selectedSourceMethod = watch("sourceMethod")
  const selectedDestinationMethod = watch("destinationMethod")
  const isRecurring = watch("recurring")

  const handleCreateIncomeSource = async () => {
    if (!newSourceName.trim()) {
      toast.error("Source name is required")
      return
    }
    setIsCreatingSource(true)
    try {
      const initialAmt = Number(newSourceInitialAmount) || 0
      const createdCat = await categoryService.createCategory({
        name: newSourceName.trim(),
        type: "income",
        initialAmount: initialAmt,
      })

      toast.success(`Income source '${createdCat.name}' created!`)
      await loadData()
      setValue("category", createdCat.name)
      if (initialAmt > 0 && !watch("amount")) {
        setValue("amount", initialAmt)
      }
      setNewSourceName("")
      setNewSourceInitialAmount("")
      setShowAddSource(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to create income source")
    } finally {
      setIsCreatingSource(false)
    }
  }

  const handleCreatePaymentMethod = async () => {
    if (!newPMName.trim()) {
      toast.error("Payment method name is required")
      return
    }
    setIsCreatingPM(true)
    try {
      const initialAmt = Number(newPMInitialAmount) || 0
      const createdPM = await paymentMethodService.createPaymentMethod({
        name: newPMName.trim(),
        type: newPMType,
        initialAmount: initialAmt,
      })

      toast.success(`Payment method '${createdPM.name}' created!`)
      await loadData()
      setValue("paymentMethod", createdPM.name)
      setValue("sourceMethod", createdPM.name)
      setNewPMName("")
      setNewPMInitialAmount("")
      setShowAddPaymentMethod(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to create payment method")
    } finally {
      setIsCreatingPM(false)
    }
  }

  const onSubmit = async (data: TransactionFormValues) => {
    setIsSubmitting(true)
    try {
      let result: TransactionItem
      const payload: any = { ...data }
      if (data.type === "transfer") {
        payload.paymentMethod = data.sourceMethod || data.paymentMethod
      }

      if (isEditing && initialData) {
        result = await transactionService.updateTransaction(initialData._id, payload)
        toast.success("Transaction updated successfully!")
      } else {
        result = await transactionService.createTransaction(payload)
        toast.success(
          `${data.type === "income" ? "Income" : data.type === "transfer" ? "Transfer" : "Expense"} added successfully!`
        )
      }
      onSuccess?.(result)
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast.error(error.message || "Failed to save transaction.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your transaction details below." : "Enter transaction details to update your cash flow."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* Type Toggle */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => {
                setValue("type", "expense")
                setValue("category", "Food")
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                selectedType === "expense" ? "bg-card text-rose-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpRight className="h-4 w-4" /> Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("type", "income")
                setValue("category", "Income")
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                selectedType === "income" ? "bg-card text-emerald-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowDownRight className="h-4 w-4" /> Income
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("type", "transfer")
                setValue("category", "Transfer")
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                selectedType === "transfer" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowLeftRight className="h-4 w-4" /> Transfer
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title / Description</Label>
              <Input id="title" placeholder="e.g., Monthly Salary or Grocery Shopping" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <CurrencyInput
                id="amount"
                placeholder="0.00"
                value={watch("amount") || ""}
                onChange={(e) => setValue("amount", parseFloat(e.target.value) || 0)}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>

            {/* Category Selection */}
            {selectedType === "income" ? (
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value="Income" disabled />
              </div>
            ) : selectedType === "expense" ? (
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={(val) => setValue("category", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value="Transfer" disabled />
              </div>
            )}
          </div>

          {/* Payment Method / Source & Destination Selection */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">
                {selectedType === "transfer" ? "Accounts / Payment Methods" : "Payment Method"}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary px-2"
                onClick={() => setShowAddPaymentMethod(!showAddPaymentMethod)}
              >
                <Plus className="h-3 w-3 mr-1" /> New Payment Method
              </Button>
            </div>

            {showAddPaymentMethod ? (
              <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Method Name (e.g. HDFC Bank, GPay, Cash Wallet)"
                    value={newPMName}
                    onChange={(e) => setNewPMName(e.target.value)}
                  />
                  <Select value={newPMType} onValueChange={(val: any) => setNewPMType(val)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PM_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <CurrencyInput
                  placeholder="Initial Balance / Amount (₹)"
                  value={newPMInitialAmount}
                  onChange={(e) => setNewPMInitialAmount(parseFloat(e.target.value) || 0)}
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowAddPaymentMethod(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={isCreatingPM}
                    onClick={handleCreatePaymentMethod}
                  >
                    {isCreatingPM ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null} Save Method
                  </Button>
                </div>
              </div>
            ) : selectedType === "transfer" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">Source Section (From)</Label>
                  <Select value={selectedSourceMethod} onValueChange={(val) => setValue("sourceMethod", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No payment methods — click + New Payment Method
                        </SelectItem>
                      ) : (
                        paymentMethods.map((pm) => (
                          <SelectItem key={`src-${pm._id || pm.name}`} value={pm.name}>
                            {pm.name} {pm.initialAmount ? `(Initial: ₹${pm.initialAmount})` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Destination Section (To)</Label>
                  <Select value={selectedDestinationMethod} onValueChange={(val) => setValue("destinationMethod", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination account" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No payment methods — click + New Payment Method
                        </SelectItem>
                      ) : (
                        paymentMethods.map((pm) => (
                          <SelectItem key={`dst-${pm._id || pm.name}`} value={pm.name}>
                            {pm.name} {pm.initialAmount ? `(Initial: ₹${pm.initialAmount})` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Select value={selectedPaymentMethod} onValueChange={(val) => setValue("paymentMethod", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No payment methods — click + New Payment Method
                        </SelectItem>
                      ) : (
                        paymentMethods.map((pm) => (
                          <SelectItem key={pm._id || pm.name} value={pm.name}>
                            {pm.name} {pm.initialAmount ? `(Initial: ₹${pm.initialAmount})` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.paymentMethod && <p className="text-xs text-destructive">{errors.paymentMethod.message}</p>}
                </div>

                <div className="space-y-2">
                  <Input id="merchant" placeholder="Merchant / Payee (e.g. Amazon)" {...register("merchant")} />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...register("time")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Memo</Label>
            <Textarea id="notes" placeholder="Additional details about this transaction..." rows={2} {...register("notes")} />
          </div>

          {/* Recurring Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/40">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Recurring Transaction</Label>
              <p className="text-xs text-muted-foreground">Automatically repeat this transaction periodically.</p>
            </div>
            <Switch checked={isRecurring} onCheckedChange={(val) => setValue("recurring", val)} />
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
                "Update Transaction"
              ) : (
                "Save Transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
