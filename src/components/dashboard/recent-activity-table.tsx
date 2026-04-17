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

export function RecentActivityTable({ title, activities, icon: Icon }: RecentActivityTableProps) {
  return (
    <div className="flex flex-col gap-4">
      {title && (
        <div className="flex items-center gap-2">
          {Icon && <Icon className="text-muted-foreground" />}
          <h3 className="text-base font-medium">{title}</h3>
        </div>
      )}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Time</TableHead>
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
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {getActivityLabel(item.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{item.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-xs">
                        {item.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.user && (
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {item.userAvatar && <AvatarImage src={item.userAvatar} />}
                          <AvatarFallback>{item.user.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{item.user}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActivityBadgeVariant(item.status)} className="text-xs">
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
