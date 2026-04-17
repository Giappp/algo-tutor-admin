import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: string
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{title}</span>
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
          {trend && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{trend}</span>
          )}
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon />
        </div>
      </div>
    </Card>
  )
}
