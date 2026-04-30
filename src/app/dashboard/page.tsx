"use client"
import { OverviewChart, RecentActivityTable, StatCard } from "@/components/dashboard"
import { ArchiveIcon, CodeIcon, FileTextIcon, RocketIcon } from "lucide-react"
import type { ActivityItem } from "@/components/dashboard/recent-activity-table"

const mockActivities: ActivityItem[] = [
    {
        id: "1",
        type: "problem",
        title: "Two Sum",
        description: "Added test cases for edge conditions",
        user: "Alice",
        userAvatar: "https://github.com/alice.png",
        timestamp: "2 min ago",
        status: "success",
    },
    {
        id: "2",
        type: "problem",
        title: "Reverse Linked List",
        description: "Published to production",
        user: "Bob",
        userAvatar: "https://github.com/bob.png",
        timestamp: "15 min ago",
        status: "success",
    },
    {
        id: "3",
        type: "user",
        title: "New user registered",
        description: "charlie@example.com joined the platform",
        user: "Charlie",
        userAvatar: "https://github.com/charlie.png",
        timestamp: "1 hour ago",
        status: "info",
    },
    {
        id: "4",
        type: "model",
        title: "GPT-4 temperature updated",
        description: "Temperature changed from 0.7 to 0.9",
        user: "Admin",
        userAvatar: "https://github.com/shadcn.png",
        timestamp: "2 hours ago",
        status: "warning",
    },
    {
        id: "5",
        type: "tag",
        title: "Tag created",
        description: "New tag 'dynamic-programming' added",
        user: "Dave",
        userAvatar: "https://github.com/dave.png",
        timestamp: "3 hours ago",
        status: "success",
    },
]

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-8">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back. Here&apos;s an overview of your platform.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Problems"
                    value="142"
                    icon={CodeIcon}
                    trend="+8 from last week"
                />
                <StatCard
                    title="Published"
                    value="98"
                    icon={RocketIcon}
                    description="69% of total"
                    trend="+12% this month"
                />
                <StatCard
                    title="Drafts"
                    value="32"
                    icon={FileTextIcon}
                    description="22% of total"
                />
                <StatCard
                    title="Archived"
                    value="12"
                    icon={ArchiveIcon}
                    description="8% of total"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <OverviewChart
                    type="bar"
                    title="Weekly Activity"
                    description="Problems and users added per day"
                />
                <OverviewChart
                    type="pie"
                    title="Difficulty Distribution"
                    description="Problems by difficulty level"
                />
                <OverviewChart
                    type="line"
                    title="Publishing Trend"
                    description="Published vs drafts over 6 months"
                />
            </div>

            {/* Activity Table */}
            <RecentActivityTable
                title="Recent Activity"
                activities={mockActivities}
            />
        </div>
    )
}
