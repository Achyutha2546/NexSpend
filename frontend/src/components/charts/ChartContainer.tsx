import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer } from "recharts"

interface ChartContainerProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function ChartContainer({ title, description, children, className }: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {/* The actual recharts components (LineChart, BarChart) will be passed as children */}
            <>{children}</>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
