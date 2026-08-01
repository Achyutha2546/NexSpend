import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TransactionItem } from "@/services/transactionService"
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, Calendar, Clock, CreditCard, Tag, Building, Copy, Archive, Trash2, Edit3 } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"

interface TransactionDetailsModalProps {
  transaction: TransactionItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (tx: TransactionItem) => void
  onDuplicate?: (tx: TransactionItem) => void
  onArchive?: (tx: TransactionItem) => void
  onDelete?: (tx: TransactionItem) => void
}

export function TransactionDetailsModal({
  transaction,
  open,
  onOpenChange,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: TransactionDetailsModalProps) {
  if (!transaction) return null

  const isIncome = transaction.type === "income"
  const isTransfer = transaction.type === "transfer"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border",
                isIncome
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : isTransfer
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              )}
            >
              {isIncome ? (
                <ArrowDownRight className="h-5 w-5" />
              ) : isTransfer ? (
                <ArrowLeftRight className="h-5 w-5" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">{transaction.title}</DialogTitle>
              <DialogDescription className="capitalize">
                {transaction.type} • {transaction.category}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Amount Display */}
          <div className="p-4 rounded-xl bg-muted/40 border text-center space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Total Amount</span>
            <div
              className={cn(
                "text-3xl font-extrabold tracking-tight",
                isIncome ? "text-emerald-500" : isTransfer ? "text-primary" : "text-foreground"
              )}
            >
              {isIncome ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">
                  {(() => {
                    const [y, m, d] = String(transaction.date).split("T")[0].split("-")
                    if (y && m && d) {
                      return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    return new Date(transaction.date).toLocaleDateString()
                  })()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium">{transaction.time || "12:00"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Payment Method</p>
                <p className="font-medium">{transaction.paymentMethod}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Merchant</p>
                <p className="font-medium">{transaction.merchant || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Status & Tags */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Status:</span>
              <Badge variant="outline" className="capitalize text-xs font-semibold">
                {transaction.status}
              </Badge>
            </div>
            {transaction.recurring && (
              <Badge variant="secondary" className="text-[10px] uppercase">
                Recurring ({transaction.recurringFrequency})
              </Badge>
            )}
          </div>

          {/* Source & Destination for Transfers */}
          {isTransfer && (
            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
              <div>
                <p className="text-xs text-muted-foreground">Source Account/Method</p>
                <p className="font-semibold">{transaction.sourceMethod || transaction.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Destination Account/Method</p>
                <p className="font-semibold">{transaction.destinationMethod || "Destination Account"}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {transaction.notes && (
            <div className="border-t pt-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Notes</p>
              <p className="text-sm bg-muted/30 p-2.5 rounded-md border text-muted-foreground">{transaction.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-wrap gap-2 sm:justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDuplicate?.(transaction)
                onOpenChange(false)
              }}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onArchive?.(transaction)
                onOpenChange(false)
              }}
            >
              <Archive className="mr-1.5 h-3.5 w-3.5" />
              {transaction.isArchived ? "Unarchive" : "Archive"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onEdit?.(transaction)
                onOpenChange(false)
              }}
            >
              <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete?.(transaction)
                onOpenChange(false)
              }}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Trash
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
