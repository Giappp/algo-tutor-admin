"use client"

import { StatCard } from "@/components/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import {
  CodeIcon,
  RocketIcon,
  UsersIcon,
  BotIcon,
  TrendingUpIcon,
  ActivityIcon,
} from "lucide-react"

const analyticsData = {
  totalProblems: 142,
  totalUsers: 2847,
  aiCallsThisMonth: 12453,
  avgResolutionTime: "2.3 min",
}

const monthlyTrend = [
  { month: "Jan", problems: 10, users: 120 },
  { month: "Feb", problems: 15, users: 180 },
  { month: "Mar", problems: 22, users: 250 },
  { month: "Apr", problems: 18, users: 310 },
  { month: "May", problems: 30, users: 420 },
  { month: "Jun", problems: 25, users: 380 },
]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Platform overview and usage statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Problems"
          value={analyticsData.totalProblems}
          icon={CodeIcon}
          trend="+8 this week"
        />
        <StatCard
          title="Total Users"
          value={analyticsData.totalUsers.toLocaleString()}
          icon={UsersIcon}
          trend="+127 this month"
        />
        <StatCard
          title="AI API Calls"
          value={analyticsData.aiCallsThisMonth.toLocaleString()}
          icon={BotIcon}
          description="This month"
          trend="+23% vs last month"
        />
        <StatCard
          title="Avg Resolution Time"
          value={analyticsData.avgResolutionTime}
          icon={TrendingUpIcon}
          description="Problem solving"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
            <CardDescription>New problems and users per month</CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewChart type="bar" title="" description="" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Breakdown</CardTitle>
            <CardDescription>Distribution of problems by difficulty</CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewChart type="pie" title="" description="" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Problems Published</CardTitle>
            <RocketIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <ActivityIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,243</div>
            <p className="text-xs text-muted-foreground">+89 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Publishing Trend</CardTitle>
            <TrendingUpIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+18%</div>
            <p className="text-xs text-muted-foreground">Compared to last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
