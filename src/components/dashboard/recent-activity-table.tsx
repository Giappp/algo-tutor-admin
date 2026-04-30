"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { LucideIcon } from "lucide-react"

export interface ActivityItem {
  id: string
  type: "problem" | "user" | "model" | "tag"
  title: string
  description: string
  user?: string
  userAvatar?: string
  timestamp: string
  status?: "success" | "warning" | "info"
}

interface RecentActivityTableProps {
  title?: string
  activities: ActivityItem[]
  icon?: LucideIcon
}

function getActivityBadgeVariant(status?: ActivityItem["status"]) {
  switch (status) {
    case "success":
      return "default"
    case "warning":
      return "secondary"
    case "info":
      return "outline"
    default:
      return "outline"
  }
}

function getActivityLabel(type: ActivityItem["type"]) {
  switch (type) {
    case "problem":
      return "Problem"
    case "user":
      return "User"
    case "model":
      return "Model"
    case "tag":
      return "Tag"
    default:
      return "Action"
  }
}

function getActivityTypeColor(type: ActivityItem["type"]) {
  switch (type) {
    case "problem":
      return "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
    case "user":
      return "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
    case "model":
      return "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
    case "tag":
      return "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
    default:
      return "bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400"
  }
}

export function RecentActivityTable({ title, activities, icon: Icon }: RecentActivityTableProps) {
  return (
    <div className="flex flex-col gap-4">
      {title && (
        <div className="flex items-center gap-2">
          {Icon && <Icon className="text-muted-foreground" />}
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-28 font-semibold text-xs uppercase tracking-wider text-muted-foreground/70">Type</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/70">Title</TableHead>
              <TableHead className="w-36 font-semibold text-xs uppercase tracking-wider text-muted-foreground/70">User</TableHead>
              <TableHead className="w-24 font-semibold text-xs uppercase tracking-wider text-muted-foreground/70">Status</TableHead>
              <TableHead className="w-28 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground/70">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No recent activity
                </TableCell>
              </TableRow>
            ) : (
              activities.map((item) => (
                <TableRow key={item.id} className="group transition-colors duration-150 hover:bg-muted/50">
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getActivityTypeColor(item.type)}`}>
                      {getActivityLabel(item.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 max-w-xs">
                      <span className="font-medium text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.user && (
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-7 h-7 border border-border/50">
                          {item.userAvatar && <AvatarImage src={item.userAvatar} />}
                          <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                            {item.user.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground">{item.user}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActivityBadgeVariant(item.status)} className="text-xs font-medium capitalize">
                      {item.status ?? "done"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {item.timestamp}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
