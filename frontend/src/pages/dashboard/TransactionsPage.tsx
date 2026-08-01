import { useState, useEffect, useCallback } from "react"
import { Heading, Caption } from "@/components/shared/Typography"
import { TransactionCard } from "@/components/cards/TransactionCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { transactionService, TransactionItem, TransactionFilterParams } from "@/services/transactionService"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"
import { TransactionDetailsModal } from "@/components/transactions/TransactionDetailsModal"
import { EmptyState } from "@/components/feedback/EmptyState"
import { PageLoader } from "@/components/feedback/PageLoader"
import { toast } from "sonner"
import { Plus, Search, CreditCard, Archive, Trash2, RotateCcw } from "lucide-react"

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all")
  const [showArchived, setShowArchived] = useState(false)
  const [showTrash, setShowTrash] = useState(false)

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [modalType, setModalType] = useState<"income" | "expense" | "transfer">("expense")
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params: TransactionFilterParams = {
        search: search || undefined,
        type: selectedType !== "all" ? selectedType : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        paymentMethod: selectedPaymentMethod !== "all" ? selectedPaymentMethod : undefined,
        isArchived: showArchived,
        isDeleted: showTrash,
        limit: 100,
      }
      const data = await transactionService.getTransactions(params)
      setTransactions(data.transactions)
    } catch (error: any) {
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }, [search, selectedType, selectedCategory, selectedPaymentMethod, showArchived, showTrash])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchTransactions])

  const handleSoftDelete = async (tx: TransactionItem) => {
    try {
      await transactionService.deleteTransaction(tx._id)
      setTransactions((prev) => prev.filter((t) => t._id !== tx._id))

      toast.success("Moved to Trash", {
        action: {
          label: "Undo",
          onClick: async () => {
            await transactionService.restoreTransaction(tx._id)
            fetchTransactions()
            toast.success("Transaction restored!")
          },
        },
      })
    } catch (error) {
      toast.error("Failed to delete transaction")
    }
  }

  const handleDuplicate = async (tx: TransactionItem) => {
    try {
      const duplicated = await transactionService.duplicateTransaction(tx._id)
      setTransactions((prev) => [duplicated, ...prev])
      toast.success("Transaction duplicated!")
    } catch (error) {
      toast.error("Failed to duplicate transaction")
    }
  }

  const handleArchiveToggle = async (tx: TransactionItem) => {
    try {
      const updated = await transactionService.archiveTransaction(tx._id)
      fetchTransactions()
      toast.success(updated.isArchived ? "Archived" : "Unarchived")
    } catch (error) {
      toast.error("Failed to archive transaction")
    }
  }

  const handleRestore = async (tx: TransactionItem) => {
    try {
      await transactionService.restoreTransaction(tx._id)
      fetchTransactions()
      toast.success("Transaction restored!")
    } catch (error) {
      toast.error("Failed to restore transaction")
    }
  }

  const handlePermanentDelete = async (tx: TransactionItem) => {
    try {
      await transactionService.permanentDeleteTransaction(tx._id)
      setTransactions((prev) => prev.filter((t) => t._id !== tx._id))
      toast.success("Permanently deleted!")
    } catch (error) {
      toast.error("Failed to permanently delete")
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-up">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading className="text-3xl">Transactions</Heading>
          <Caption>Track, filter, and manage all your income and expenses.</Caption>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditingTx(null)
              setModalType("expense")
              setIsAddOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border bg-card space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, merchant, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Bills">Bills</SelectItem>
                <SelectItem value="Salary">Salary</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Debit Card">Debit Card</SelectItem>
                <SelectItem value="Bank Account">Bank Account</SelectItem>
                <SelectItem value="Wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showArchived ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setShowArchived(!showArchived)
                setShowTrash(false)
              }}
            >
              <Archive className="mr-1.5 h-4 w-4" /> Archived
            </Button>

            <Button
              variant={showTrash ? "destructive" : "outline"}
              size="sm"
              onClick={() => {
                setShowTrash(!showTrash)
                setShowArchived(false)
              }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Trash
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction List / Content */}
      {loading ? (
        <PageLoader />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={showTrash ? "Trash is empty" : showArchived ? "No archived transactions" : "No transactions found"}
          description={
            showTrash
              ? "Transactions moved to trash will appear here."
              : "Start recording your income and expenses to track your financial cash flow."
          }
          actionLabel={!showTrash && !showArchived ? "Add First Transaction" : undefined}
          onAction={
            !showTrash && !showArchived
              ? () => {
                  setEditingTx(null)
                  setIsAddOpen(true)
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx._id} className="relative group">
              <div
                onClick={() => {
                  setSelectedTx(tx)
                  setIsDetailsOpen(true)
                }}
                className="cursor-pointer"
              >
                <TransactionCard
                  id={tx._id}
                  title={tx.title}
                  merchant={tx.merchant || tx.category}
                  amount={tx.type === "income" ? tx.amount : -tx.amount}
                  date={(() => {
                    const [y, m, d] = String(tx.date).split("T")[0].split("-")
                    if (y && m && d) {
                      return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    return new Date(tx.date).toLocaleDateString()
                  })()}
                  type={tx.type === "income" ? "income" : "expense"}
                  category={tx.category}
                  status={tx.status}
                />
              </div>

              {/* Action Buttons overlay for Trash/Restore */}
              {showTrash && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleRestore(tx)}>
                    <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handlePermanentDelete(tx)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddTransactionModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        defaultType={modalType}
        initialData={editingTx}
        onSuccess={() => fetchTransactions()}
      />

      <TransactionDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        transaction={selectedTx}
        onEdit={(tx) => {
          setEditingTx(tx)
          setIsAddOpen(true)
        }}
        onDuplicate={handleDuplicate}
        onArchive={handleArchiveToggle}
        onDelete={handleSoftDelete}
      />
    </div>
  )
}
