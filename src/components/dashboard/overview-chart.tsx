"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import type { ChartConfig } from "@/components/ui/chart"

const chartConfig: ChartConfig = {
  problems: { label: "Problems", color: "hsl(var(--chart-1))" },
  users: { label: "Users", color: "hsl(var(--chart-2))" },
  models: { label: "Models", color: "hsl(var(--chart-3))" },
  archived: { label: "Archived", color: "hsl(var(--chart-4))" },
  drafts: { label: "Drafts", color: "hsl(var(--chart-5))" },
}

const weeklyData = [
  { week: "Mon", problems: 12, users: 5 },
  { week: "Tue", problems: 8, users: 3 },
  { week: "Wed", problems: 15, users: 7 },
  { week: "Thu", problems: 6, users: 2 },
  { week: "Fri", problems: 20, users: 9 },
  { week: "Sat", problems: 4, users: 1 },
  { week: "Sun", problems: 7, users: 4 },
]

const difficultyData = [
  { name: "Easy", value: 45, fill: "hsl(var(--chart-1))" },
  { name: "Medium", value: 35, fill: "hsl(var(--chart-2))" },
  { name: "Hard", value: 20, fill: "hsl(var(--chart-3))" },
]

const trendData = [
  { month: "Jan", published: 30, drafts: 10 },
  { month: "Feb", published: 45, drafts: 15 },
  { month: "Mar", published: 60, drafts: 12 },
  { month: "Apr", published: 55, drafts: 8 },
  { month: "May", published: 70, drafts: 20 },
  { month: "Jun", published: 85, drafts: 18 },
]

interface OverviewChartProps {
  type?: "bar" | "pie" | "line"
  title: string
  description?: string
}

export function OverviewChart({ type = "bar", title, description }: OverviewChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {type === "bar" && (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={weeklyData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <Bar
                dataKey="problems"
                fill="var(--color-problems)"
                radius={4}
                name="Problems"
              />
              <Bar
                dataKey="users"
                fill="var(--color-users)"
                radius={4}
                name="Users"
              />
            </BarChart>
          </ChartContainer>
        )}
        {type === "pie" && (
          <div className="flex items-center gap-8">
            <ChartContainer config={chartConfig} className="h-52 w-52">
              <PieChart accessibilityLayer>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-2">
              {difficultyData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {type === "line" && (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <LineChart data={trendData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <Line
                type="monotone"
                dataKey="published"
                stroke="var(--color-problems)"
                strokeWidth={2}
                dot={false}
                name="Published"
              />
              <Line
                type="monotone"
                dataKey="drafts"
                stroke="var(--color-drafts)"
                strokeWidth={2}
                dot={false}
                name="Drafts"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
