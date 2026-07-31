import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MailCheck, Loader2 } from "lucide-react"

export function EmailVerificationPage() {
  const { resendVerificationEmail, firebaseUser, logout } = useAuth()
  const [isResending, setIsResending] = useState(false)

  const handleResend = async () => {
    setIsResending(true)
    try {
      await resendVerificationEmail()
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-border/40 text-center">
      <CardHeader className="space-y-1">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          <MailCheck className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          We sent a verification email to <span className="font-semibold text-foreground">{firebaseUser?.email}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Please check your inbox and click the link in the verification email to confirm your account and access full functionality.
        </p>
        <Button onClick={handleResend} disabled={isResending} className="w-full">
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Email...
            </>
          ) : (
            "Resend Verification Email"
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <Button variant="ghost" size="sm" onClick={logout}>
          Sign Out & Return
        </Button>
      </CardFooter>
    </Card>
  )
}
