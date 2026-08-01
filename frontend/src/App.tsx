import { HashRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { GuestRoute } from "./components/auth/GuestRoute"
import { Toaster } from "sonner"

import { OfflineIndicator } from "./components/pwa/OfflineIndicator"
import { PWAInstallBanner } from "./components/pwa/PWAInstallBanner"
import { WelcomeModal } from "./components/onboarding/WelcomeModal"
import { KeyboardShortcuts } from "./components/shared/KeyboardShortcuts"

import { AuthLayout } from "./layouts/AuthLayout"
import { DashboardLayout } from "./layouts/DashboardLayout"
import { LoginPage } from "./pages/auth/LoginPage"
import { RegisterPage } from "./pages/auth/RegisterPage"
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage"
import { EmailVerificationPage } from "./pages/auth/EmailVerificationPage"
import { UnauthorizedPage } from "./pages/auth/UnauthorizedPage"
import { SessionExpiredPage } from "./pages/auth/SessionExpiredPage"

import { LandingPage } from "./pages/LandingPage"
import { DashboardPage } from "./pages/dashboard/DashboardPage"
import { TransactionsPage } from "./pages/dashboard/TransactionsPage"
import { AnalyticsPage } from "./pages/dashboard/AnalyticsPage"
import { BudgetPage } from "./pages/dashboard/BudgetPage"
import { RecurringPage } from "./pages/dashboard/RecurringPage"
import { GoalsPage } from "./pages/dashboard/GoalsPage"
import { SettingsPage } from "./pages/dashboard/SettingsPage"
import { ReportsPage } from "./pages/dashboard/ReportsPage"
import { NotificationsPage } from "./pages/dashboard/NotificationsPage"
import { CalendarPage } from "./pages/dashboard/CalendarPage"
import { AICoachPage } from "./pages/dashboard/AICoachPage"
import { ProductivityPage } from "./pages/dashboard/ProductivityPage"

function App() {
  return (
    <AuthProvider>
      <OfflineIndicator />
      <Toaster position="top-right" richColors />
      <PWAInstallBanner />
      <WelcomeModal />
      <HashRouter>
        <KeyboardShortcuts />
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Guest Only Routes */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
          </Route>

          {/* Standalone Auth Pages */}
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/session-expired" element={<SessionExpiredPage />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="ai-coach" element={<AICoachPage />} />
              <Route path="productivity" element={<ProductivityPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="budget" element={<BudgetPage />} />
              <Route path="recurring" element={<RecurringPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App
