import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { aiService, LLMResponse } from "@/services/aiService"
import { toast } from "sonner"
import { Bot, User, Send, Copy, Sparkles, Loader2 } from "lucide-react"

interface MessageItem {
  id: string
  sender: "user" | "assistant"
  text: string
  timestamp: string
}

interface AIChatDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SUGGESTED_QUESTIONS = [
  "Where did I spend the most this month?",
  "Am I staying within budget?",
  "How can I save $500 more every month?",
  "Which category increased the most?",
]

export function AIChatDrawer({ open, onOpenChange }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome-msg",
      sender: "assistant",
      text: "Hello! I am your AI Financial Advisor. Ask me anything about your spending, budgets, savings goals, or cashflow forecasts.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isSending])

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || isSending) return

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput("")
    setIsSending(true)

    try {
      const res: LLMResponse = await aiService.askQuery(query)
      const botMsg: MessageItem = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: res.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (error) {
      toast.error("AI Assistant request failed.")
    } finally {
      setIsSending(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied message to clipboard")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[620px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-card">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" /> NexSpend AI Advisor
          </DialogTitle>
          <DialogDescription>Interactive conversational financial coach</DialogDescription>
        </DialogHeader>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/20">
          {messages.map((m) => {
            const isUser = m.sender === "user"

            return (
              <div key={m.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isUser ? "bg-primary text-primary-foreground" : "bg-emerald-500/10 text-emerald-600 border"
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`space-y-1 max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
                  <div
                    className={`p-3 rounded-xl text-sm leading-relaxed ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card border rounded-tl-none shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                  <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <button type="button" onClick={() => handleCopy(m.text)} className="hover:text-foreground">
                        <Copy className="h-3 w-3 inline" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {isSending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 border flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3 rounded-xl bg-card border rounded-tl-none flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Analyzing your financial data...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-3 border-t bg-card space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground">Suggested Questions:</p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {SUGGESTED_QUESTIONS.map((q) => (
              <Badge
                key={q}
                variant="outline"
                className="cursor-pointer whitespace-nowrap text-[11px] hover:bg-primary/10"
                onClick={() => handleSend(q)}
              >
                {q}
              </Badge>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2 pt-1"
          >
            <Input
              placeholder="Ask AI Advisor..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="text-xs h-9"
            />
            <Button type="submit" size="sm" className="h-9 px-3" disabled={isSending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
