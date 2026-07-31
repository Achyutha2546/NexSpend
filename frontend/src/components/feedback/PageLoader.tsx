import { Loader2 } from "lucide-react"

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin text-primary ${className || "h-4 w-4"}`} />
}
