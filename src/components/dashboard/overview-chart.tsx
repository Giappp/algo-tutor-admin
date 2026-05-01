"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import type {ChartConfig} from "@/components/ui/chart"
import {ChartContainer,} from "@/components/ui/chart"
import {Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis,} from "recharts"

const chartConfig: ChartConfig = {
    problems: {label: "Problems", color: "hsl(var(--chart-1))"},
    users: {label: "Users", color: "hsl(var(--chart-2))"},
    models: {label: "Models", color: "hsl(var(--chart-3))"},
    archived: {label: "Archived", color: "hsl(var(--chart-4))"},
    drafts: {label: "Drafts", color: "hsl(var(--chart-5))"},
}

const weeklyData = [
    {week: "Mon", problems: 12, users: 5},
    {week: "Tue", problems: 8, users: 3},
    {week: "Wed", problems: 15, users: 7},
    {week: "Thu", problems: 6, users: 2},
    {week: "Fri", problems: 20, users: 9},
    {week: "Sat", problems: 4, users: 1},
    {week: "Sun", problems: 7, users: 4},
]

const difficultyData = [
    {name: "Easy", value: 45, fill: "hsl(var(--chart-1))"},
    {name: "Medium", value: 35, fill: "hsl(var(--chart-2))"},
    {name: "Hard", value: 20, fill: "hsl(var(--chart-3))"},
]

const trendData = [
    {month: "Jan", published: 30, drafts: 10},
    {month: "Feb", published: 45, drafts: 15},
    {month: "Mar", published: 60, drafts: 12},
    {month: "Apr", published: 55, drafts: 8},
    {month: "May", published: 70, drafts: 20},
    {month: "Jun", published: 85, drafts: 18},
]

interface OverviewChartProps {
    type?: "bar" | "pie" | "line"
    title: string
    description?: string
}

export function OverviewChart({type = "bar", title, description}: OverviewChartProps) {
    return (
        <Card
            className="transition-all duration-300 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold">{title}</CardTitle>
                        {description && <CardDescription className="text-xs mt-1">{description}</CardDescription>}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                {type === "bar" && (
                    <ChartContainer config={chartConfig} className="h-56 w-full">
                        <BarChart data={weeklyData} accessibilityLayer>
                            <CartesianGrid vertical={false} strokeDasharray="3 3"
                                           className="stroke-zinc-200 dark:stroke-zinc-800"/>
                            <XAxis
                                dataKey="week"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}}
                            />
                            <YAxis
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}}
                            />
                            <Bar
                                dataKey="problems"
                                fill="var(--color-chart-1)"
                                radius={[6, 6, 0, 0]}
                                name="Problems"
                            />
                            <Bar
                                dataKey="users"
                                fill="var(--color-chart-2)"
                                radius={[6, 6, 0, 0]}
                                name="Users"
                            />
                        </BarChart>
                    </ChartContainer>
                )}
                {type === "pie" && (
                    <div className="flex items-center gap-6">
                        <ChartContainer config={chartConfig} className="h-48 w-48">
                            <PieChart accessibilityLayer>
                                <Pie
                                    data={difficultyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    dataKey="value"
                                    nameKey="name"
                                    labelLine={false}
                                    paddingAngle={3}
                                >
                                    {difficultyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill}
                                              className="transition-all duration-200 hover:opacity-80"/>
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                        <div className="flex flex-col gap-3">
                            {difficultyData.map((item) => (
                                <div key={item.name} className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full shadow-sm"
                                        style={{backgroundColor: item.fill}}
                                    />
                                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                                    <span className="text-sm text-muted-foreground ml-auto">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {type === "line" && (
                    <ChartContainer config={chartConfig} className="h-56 w-full">
                        <LineChart data={trendData} accessibilityLayer>
                            <CartesianGrid vertical={false} strokeDasharray="3 3"
                                           className="stroke-zinc-200 dark:stroke-zinc-800"/>
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}}
                            />
                            <YAxis
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}}
                            />
                            <Line
                                type="monotone"
                                dataKey="published"
                                stroke="var(--color-chart-1)"
                                strokeWidth={2.5}
                                dot={{fill: "var(--color-chart-1)", strokeWidth: 0, r: 4}}
                                activeDot={{fill: "var(--color-chart-1)", strokeWidth: 0, r: 6}}
                                name="Published"
                            />
                            <Line
                                type="monotone"
                                dataKey="drafts"
                                stroke="var(--color-chart-5)"
                                strokeWidth={2.5}
                                dot={{fill: "var(--color-chart-5)", strokeWidth: 0, r: 4}}
                                activeDot={{fill: "var(--color-chart-5)", strokeWidth: 0, r: 6}}
                                name="Drafts"
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
