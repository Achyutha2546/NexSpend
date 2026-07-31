import { PageLoader } from "./PageLoader"

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <PageLoader />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Authenticating & restoring session...
        </p>
      </div>
    </div>
  )
}
