"use client"
import { OverviewChart, RecentActivityTable, StatCard } from "@/components/dashboard"
import { ArchiveIcon, CodeIcon, FileTextIcon, RocketIcon } from "lucide-react"
import type { ActivityItem } from "@/components/dashboard/recent-activity-table"
import { useTranslations } from "next-intl"

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
    const t = useTranslations("dashboard")

    return (
        <div className="flex flex-col gap-8">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
                <p className="text-muted-foreground">{t("welcome")}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={t("totalProblems")}
                    value="142"
                    icon={CodeIcon}
                    trend={t("fromLastWeek", { count: 8 })}
                />
                <StatCard
                    title={t("published")}
                    value="98"
                    icon={RocketIcon}
                    description={t("ofTotal", { percentage: 69 })}
                    trend={t("thisMonth", { percentage: 12 })}
                />
                <StatCard
                    title={t("drafts")}
                    value="32"
                    icon={FileTextIcon}
                    description={t("ofTotal", { percentage: 22 })}
                />
                <StatCard
                    title={t("archived")}
                    value="12"
                    icon={ArchiveIcon}
                    description={t("ofTotal", { percentage: 8 })}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <OverviewChart
                    type="bar"
                    title={t("weeklyActivity")}
                    description={t("weeklyActivityDesc")}
                />
                <OverviewChart
                    type="pie"
                    title={t("difficultyDistribution")}
                    description={t("difficultyDistributionDesc")}
                />
                <OverviewChart
                    type="line"
                    title={t("publishingTrend")}
                    description={t("publishingTrendDesc")}
                />
            </div>

            {/* Activity Table */}
            <RecentActivityTable
                title={t("recentActivity")}
                activities={mockActivities}
            />
        </div>
    )
}
