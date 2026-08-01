import { useState, useEffect } from "react"
import { Heading, Caption } from "@/components/shared/Typography"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { settingsService, UserPreferencesData, NotificationPreferencesData, UserSessionItem } from "@/services/settingsService"
import { transactionService } from "@/services/transactionService"
import { categoryDetectionService } from "@/services/categoryDetectionService"
import { SyncStatusWidget } from "@/components/pwa/SyncStatusWidget"
import { useAuth } from "@/context/AuthContext"
import { PageLoader } from "@/components/feedback/PageLoader"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  User,
  Palette,
  DollarSign,
  Bell,
  Shield,
  Download,
  Trash2,
  Laptop,
  AlertTriangle,
  Loader2,
  Sparkles,
  CreditCard,
  Edit,
} from "lucide-react"
import { paymentMethodService, PaymentMethodItem } from "@/services/paymentMethodService"
import { formatCurrency } from "@/utils/formatCurrency"
import { resetAllBalances } from "@/services/resetBalances"

export function SettingsPage() {
  const { firebaseUser, mongoUser, logout, updateProfile } = useAuth()
  const [prefs, setPrefs] = useState<UserPreferencesData | null>(null)
  const [notifs, setNotifs] = useState<NotificationPreferencesData | null>(null)
  const [sessions, setSessions] = useState<UserSessionItem[]>([])
  const [loading, setLoading] = useState(true)

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([])
  const [isPMDialogOpen, setIsPMDialogOpen] = useState(false)
  const [editingPM, setEditingPM] = useState<PaymentMethodItem | null>(null)
  const [pmName, setPmName] = useState("")
  const [pmType, setPmType] = useState<PaymentMethodItem["type"]>("Cash")
  const [pmInitial, setPmInitial] = useState<string>("")

  // Profile Form
  const [displayName, setDisplayName] = useState(mongoUser?.name || firebaseUser?.displayName || "")
  const [email] = useState(firebaseUser?.email || mongoUser?.email || "")

  useEffect(() => {
    async function loadAll() {
      setLoading(true)
      try {
        const [p, n, s, pm, dashSummary] = await Promise.all([
          settingsService.getPreferences(),
          settingsService.getNotificationPreferences(),
          settingsService.getSessions(),
          paymentMethodService.getPaymentMethods(),
          transactionService.getDashboardSummary().catch(() => null),
        ])
        setPrefs(p)
        setNotifs(n)
        setSessions(s)
        
        if (dashSummary?.paymentMethodBreakdown) {
          const mappedPMs = pm.map((method: PaymentMethodItem) => {
            const breakdown = dashSummary.paymentMethodBreakdown?.find((b: any) => b.name === method.name)
            return {
              ...method,
              balance: breakdown ? breakdown.balance : method.initialAmount || 0,
            }
          })
          setPaymentMethods(mappedPMs as any)
        } else {
          setPaymentMethods(pm)
        }
      } catch (error) {
        toast.error("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  // Account Deletion Dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ name: displayName })
      toast.success("Profile saved successfully!")
    } catch (error) {
      toast.error("Failed to save profile.")
    }
  }

  // Payment Methods handlers
  const resetPMForm = () => {
    setPmName("")
    setPmType("Cash")
    setPmInitial("")
    setEditingPM(null)
  }

  const handleSubmitPM = async () => {
    const payload: Partial<PaymentMethodItem> = {
      name: pmName,
      type: pmType,
      initialAmount: pmInitial ? Number(pmInitial) : undefined,
    }
    try {
      if (editingPM && editingPM._id) {
        const updated = await paymentMethodService.updatePaymentMethod(editingPM._id, payload)
        setPaymentMethods((prev) => prev.map((pm) => pm._id === updated._id ? updated : pm))
        toast.success("Payment method updated!")
      } else {
        const created = await paymentMethodService.createPaymentMethod(payload)
        setPaymentMethods((prev) => [...prev, created])
        toast.success("Payment method added!")
      }
      setIsPMDialogOpen(false)
      resetPMForm()
    } catch (error) {
      toast.error("Failed to save payment method.")
    }
  }

  const handleEditPM = (pm: PaymentMethodItem) => {
    setEditingPM(pm)
    setPmName(pm.name)
    setPmType(pm.type)
    setPmInitial(pm.initialAmount !== undefined ? String(pm.initialAmount) : "")
    setIsPMDialogOpen(true)
  }

  const handleDeletePM = async (id: string) => {
    try {
      await paymentMethodService.deletePaymentMethod(id)
      setPaymentMethods((prev) => prev.filter((pm) => pm._id !== id))
      toast.success("Payment method deleted")
    } catch (error) {
      toast.error("Failed to delete payment method")
    }
  }

  const handleSavePreferences = async (updated: Partial<UserPreferencesData>) => {
    try {
      const res = await settingsService.updatePreferences(updated)
      setPrefs(res)
      toast.success("Preferences updated!")
    } catch (error) {
      toast.error("Failed to update preferences.")
    }
  }

  const handleSaveNotifications = async (updated: Partial<NotificationPreferencesData>) => {
    try {
      const res = await settingsService.updateNotificationPreferences(updated)
      setNotifs(res)
      toast.success("Notification preferences saved!")
    } catch (error) {
      toast.error("Failed to save notifications.")
    }
  }

  const handleExportData = async () => {
    try {
      toast.info("Preparing data export...")
      await settingsService.exportUserData()
      toast.success("Data export downloaded!")
    } catch (error) {
      toast.error("Failed to export user data.")
    }
  }

  const handleTerminateSessions = async () => {
    try {
      await settingsService.terminateAllOtherSessions()
      setSessions((prev) => prev.filter((s) => s.isCurrent))
      toast.success("All other active sessions terminated!")
    } catch (error) {
      toast.error("Failed to terminate sessions.")
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE PERMANENTLY") {
      toast.error('Type "DELETE PERMANENTLY" to confirm.')
      return
    }

    setIsDeleting(true)
    try {
      await settingsService.deleteAccount()
      toast.success("Account and associated data deleted.")
      logout()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-up max-w-5xl">
      <div>
        <Heading className="text-3xl">Account & System Settings</Heading>
        <Caption>Manage profile details, theme appearance, privacy preferences, and security sessions.</Caption>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full h-auto p-1 bg-muted/60">
          <TabsTrigger value="profile" className="text-xs flex items-center gap-1.5 py-2">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs flex items-center gap-1.5 py-2">
            <Palette className="h-3.5 w-3.5" /> Theme
          </TabsTrigger>
          <TabsTrigger value="financial" className="text-xs flex items-center gap-1.5 py-2">
            <DollarSign className="h-3.5 w-3.5" /> Currency
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs flex items-center gap-1.5 py-2">
            <Bell className="h-3.5 w-3.5" /> Alerts
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs flex items-center gap-1.5 py-2">
            <Sparkles className="h-3.5 w-3.5" /> AI Coach
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs flex items-center gap-1.5 py-2">
            <Shield className="h-3.5 w-3.5" /> Sessions
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs flex items-center gap-1.5 py-2">
            <Download className="h-3.5 w-3.5" /> Privacy & Data
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs flex items-center gap-1.5 py-2">
            <CreditCard className="h-3.5 w-3.5" /> Payment Methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Update your display name and contact email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={email} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appearance & Theme</CardTitle>
              <CardDescription>Customize dark mode, compact density, and motion effects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-md">
              <div className="space-y-2">
                <Label>Theme Preference</Label>
                <Select
                  value={prefs?.theme || "dark"}
                  onValueChange={(val: any) => handleSavePreferences({ theme: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark Mode (Default)</SelectItem>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="system">System Preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-semibold text-sm">Compact Density Mode</p>
                  <p className="text-xs text-muted-foreground">Reduce UI padding for dense financial tables.</p>
                </div>
                <Switch
                  checked={prefs?.compactMode || false}
                  onCheckedChange={(val) => handleSavePreferences({ compactMode: val })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Configuration</CardTitle>
              <CardDescription>Set default currency symbol and initial category defaults.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Primary Currency</Label>
                <Select
                  value={prefs?.currency || "INR"}
                  onValueChange={(val) => {
                    const symbols: { [key: string]: string } = { USD: "$", EUR: "€", INR: "₹", GBP: "£" }
                    handleSavePreferences({ currency: val, currencySymbol: symbols[val] || "$" })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Payment Method</Label>
                <Input
                  value={prefs?.defaultPaymentMethod || "Credit Card"}
                  onChange={(e) => handleSavePreferences({ defaultPaymentMethod: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manage Payment Methods</CardTitle>
              <CardDescription>
                Add, edit, or delete your payment methods. Initial amount sets starting balance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <Button onClick={() => setIsPMDialogOpen(true)}><CreditCard className="mr-2 h-4 w-4"/>Add Payment Method</Button>
              <Button variant="destructive" className="ml-2" onClick={async () => {
                try {
                  await resetAllBalances();
                  toast.success("All balances and transactions reset");
                  const refreshedPM = await paymentMethodService.getPaymentMethods();
                  setPaymentMethods(refreshedPM);
                } catch (e) {
                  toast.error("Failed to reset balances");
                }
              }}>
                Reset All Balances
              </Button>
              {paymentMethods.map((pm: any) => (
                <div key={pm._id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {pm.name} <span className="text-xs font-normal text-muted-foreground">({pm.type})</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Current Balance: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(pm.balance !== undefined ? pm.balance : pm.initialAmount || 0, prefs?.currencySymbol || '₹')}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditPM(pm)}><Edit className="h-3 w-3"/></Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeletePM(pm._id!)}><Trash2 className="h-3 w-3"/></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <CardDescription>Control budget limit triggers and recurring reminder alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-semibold text-sm">Budget Threshold Alerts</p>
                  <p className="text-xs text-muted-foreground">Notify when spending reaches 80% or exceeds budget.</p>
                </div>
                <Switch
                  checked={notifs?.budgetAlerts ?? true}
                  onCheckedChange={(val) => handleSaveNotifications({ budgetAlerts: val })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-semibold text-sm">Recurring Reminders</p>
                  <p className="text-xs text-muted-foreground">Get notified before automated bills are executed.</p>
                </div>
                <Switch
                  checked={notifs?.recurringReminders ?? true}
                  onCheckedChange={(val) => handleSaveNotifications({ recurringReminders: val })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-semibold text-sm">Monthly Summary Reports</p>
                  <p className="text-xs text-muted-foreground">Receive automated executive income/expense digests.</p>
                </div>
                <Switch
                  checked={notifs?.monthlyReport ?? true}
                  onCheckedChange={(val) => handleSaveNotifications({ monthlyReport: val })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Financial Coach Preferences</CardTitle>
              <CardDescription>Configure AI provider selection, insight frequency, and privacy controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-md">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-semibold text-sm">Smart Category Auto-Detection</p>
                  <p className="text-xs text-muted-foreground">Automatically suggest categories as you type transaction titles.</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await categoryDetectionService.clearMappings()
                      toast.success("Learned merchant mappings cleared!")
                    } catch {
                      toast.error("Failed to clear mappings.")
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear Learned Merchant Mappings
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    try {
                      const mappings = await categoryDetectionService.getMappings()
                      const blob = new Blob([JSON.stringify(mappings, null, 2)], { type: "application/json" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = "nexspend-merchant-mappings.json"
                      a.click()
                      toast.success("Exported learned merchant mappings!")
                    } catch {
                      toast.error("Failed to export mappings.")
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Export Learned Mappings (.json)
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Preferred AI LLM Provider</Label>
                <Select defaultValue="openai">
                  <SelectTrigger>
                    <SelectValue placeholder="AI Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                    <SelectItem value="gemini">Google Gemini (1.5 Pro)</SelectItem>
                    <SelectItem value="claude">Anthropic Claude (3.5 Sonnet)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Insight Generation Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Executive Summaries</SelectItem>
                    <SelectItem value="weekly">Weekly Summaries</SelectItem>
                    <SelectItem value="monthly">Monthly Reviews Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Background Sync & Device State</CardTitle>
                <CardDescription>Monitor offline actions queue and multi-device sync status.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <SyncStatusWidget />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Active Device Sessions</CardTitle>
                <CardDescription>Devices logged into your NexSpend account.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleTerminateSessions}>
                Terminate Other Sessions
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-sm">
                  <div className="flex items-center gap-3">
                    <Laptop className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{s.device}</p>
                      <p className="text-xs text-muted-foreground">IP: {s.ip} • {s.lastActive}</p>
                    </div>
                  </div>
                  {s.isCurrent && (
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                      Current Device
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export My Personal Data</CardTitle>
              <CardDescription>Download a complete JSON backup of transactions, budgets, goals, and history.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" /> Download Complete Backup (.json)
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Danger Zone: Delete Account
              </CardTitle>
              <CardDescription>
                Permanently erase your NexSpend account, transactions, recurring rules, and budget limits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Permanently Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Delete Account Confirmation
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your financial data will be erased forever.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <p className="text-xs text-muted-foreground">
              To proceed, please type <strong className="text-foreground font-mono">DELETE PERMANENTLY</strong> below:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE PERMANENTLY"
              className="font-mono text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE PERMANENTLY" || isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Confirm Permanent Deletion"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPMDialogOpen} onOpenChange={setIsPMDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingPM ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
            <DialogDescription>
              {editingPM ? "Modify the details of the payment method." : "Create a new payment method and set an initial amount."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="pm-name">Name</Label>
            <Input id="pm-name" value={pmName} onChange={(e) => setPmName(e.target.value)} placeholder="e.g. My Credit Card" />
            <Label htmlFor="pm-type">Type</Label>
            <Select value={pmType} onValueChange={(v) => setPmType(v as PaymentMethodItem["type"]) }>
              <SelectTrigger id="pm-type"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Debit Card">Debit Card</SelectItem>
                <SelectItem value="Bank Account">Bank Account</SelectItem>
                <SelectItem value="Wallet">Wallet</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="pm-initial">Initial Amount (optional)</Label>
            <Input id="pm-initial" type="number" value={pmInitial} onChange={(e) => setPmInitial(e.target.value)} placeholder="0" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsPMDialogOpen(false); resetPMForm(); }}>Cancel</Button>
            <Button onClick={handleSubmitPM}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
