import { Outlet } from "react-router-dom"

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md bg-card border rounded-lg shadow-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">NexSpend</h1>
          <p className="text-muted-foreground">Manage your finances with ease</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
