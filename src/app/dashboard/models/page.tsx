"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import {
  BotIcon,
  PlayIcon,
  PauseIcon,
  SettingsIcon,
  TrashIcon,
  TestTubeIcon,
  ActivityIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AIModel {
  id: string
  name: string
  provider: string
  status: "active" | "paused" | "inactive"
  calls: number
  temperature: number
  maxTokens: number
  streaming: boolean
  description: string
}

const mockModels: AIModel[] = [
  {
    id: "1",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    status: "active",
    calls: 8432,
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    description: "Most capable model for complex reasoning and generation tasks.",
  },
  {
    id: "2",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    status: "active",
    calls: 5218,
    temperature: 0.5,
    maxTokens: 2048,
    streaming: true,
    description: "Fast and cost-effective for simple generation tasks.",
  },
  {
    id: "3",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    status: "active",
    calls: 2941,
    temperature: 0.8,
    maxTokens: 8192,
    streaming: false,
    description: "Balanced model with strong reasoning capabilities.",
  },
  {
    id: "4",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    status: "paused",
    calls: 1203,
    temperature: 0.6,
    maxTokens: 4096,
    streaming: true,
    description: "Fast, lightweight model for quick responses.",
  },
]

function getStatusBadgeVariant(status: AIModel["status"]) {
  switch (status) {
    case "active":
      return "default"
    case "paused":
      return "secondary"
    case "inactive":
      return "outline"
    default:
      return "outline"
  }
}

export default function ModelsPage() {
  const [models, setModels] = useState<AIModel[]>(mockModels)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const toggleModelStatus = (id: string) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === "active" ? "paused" : "active" }
          : m
      )
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Models</h1>
          <p className="text-muted-foreground">Configure and manage AI model integrations.</p>
        </div>
        <Button>
          <SettingsIcon data-icon="inline-start" />
          Add Model
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {models.map((model) => (
          <Card key={model.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BotIcon />
                </div>
                <div>
                  <CardTitle className="text-base">{model.name}</CardTitle>
                  <CardDescription>{model.provider}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(model.status) as "default" | "secondary" | "outline" | "destructive" | null | undefined}>
                  {model.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => toggleExpanded(model.id)}
                >
                  {expandedId === model.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <ActivityIcon className="size-4 text-muted-foreground" />
                  <span>{model.calls.toLocaleString()} calls</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Temp:</span>
                  <span className="font-medium">{model.temperature}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Max:</span>
                  <span className="font-medium">{model.maxTokens}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Stream:</span>
                  <span className="font-medium">{model.streaming ? "Yes" : "No"}</span>
                </div>
              </div>

              {expandedId === model.id && (
                <div className="mt-4 flex flex-col gap-4">
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Temperature</span>
                      <span className="text-sm text-muted-foreground">{model.temperature}</span>
                    </div>
                    <Slider defaultValue={model.temperature * 100} max={100} step={1} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Streaming</span>
                    <Switch checked={model.streaming} />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleModelStatus(model.id)}
                    >
                      {model.status === "active" ? (
                        <>
                          <PauseIcon data-icon="inline-start" />
                          Pause
                        </>
                      ) : (
                        <>
                          <PlayIcon data-icon="inline-start" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <TestTubeIcon data-icon="inline-start" />
                      Test
                    </Button>
                    <Button variant="outline" size="sm" className="ml-auto">
                      <SettingsIcon data-icon="inline-start" />
                      Configure
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
