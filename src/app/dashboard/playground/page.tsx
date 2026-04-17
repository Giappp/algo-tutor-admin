"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import {
  PlayIcon,
  SparklesIcon,
  Loader2Icon,
  CopyIcon,
  TrashIcon,
  MessageSquareIcon,
  ClockIcon,
} from "lucide-react"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

const mockPrompt = `Generate a Two Sum problem with the following requirements:

1. **Difficulty**: Medium
2. **Topics**: Array, Hash Table
3. **Description**: Write a function that finds two numbers in an array that add up to a specific target.
4. **Constraints**: 
   - Each input would have exactly one solution
   - You may not use the same element twice
5. **Examples**:
   Input: nums = [2,7,11,15], target = 9
   Output: [0,1]

Generate:
- A clear problem statement
- Test cases with expected outputs
- Hint for solving
- Explanation of the approach`

const mockGenerated = {
  title: "Two Sum",
  difficulty: "Medium",
  topics: ["Array", "Hash Table"],
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  testCases: [
    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
    { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    { input: "nums = [3,3], target = 6", output: "[0,1]" },
  ],
  hint: "A brute force approach would be O(n^2). Can you use a hash map to reduce this to O(n)?",
  statistics: {
    acceptanceRate: "68%",
    difficulty: { easy: 49, medium: 35, hard: 16 },
    avgTime: "12 min",
  },
}

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState(mockPrompt)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(mockGenerated)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Playground</h1>
          <p className="text-muted-foreground">AI-powered problem generation with live preview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <CopyIcon data-icon="inline-start" />
            Copy
          </Button>
          <Button variant="outline">
            <TrashIcon data-icon="inline-start" />
            Clear
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <SparklesIcon data-icon="inline-start" />
            )}
            Generate
          </Button>
        </div>
      </div>

      <ResizablePanelGroup orientation="horizontal" className="min-h-[600px]">
        <ResizablePanel defaultSize="50%" minSize={30}>
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Prompt</CardTitle>
              <CardDescription>Describe the problem you want to generate.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="h-full border-0">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="markdown"
                  value={prompt}
                  onChange={(value) => setPrompt(value || "")}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "off",
                    wordWrap: "on",
                    padding: { top: 16 },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="50%" minSize={30}>
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>Generated problem preview with statistics.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-4 pr-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{generated.title}</h3>
                    <Badge variant="outline">{generated.difficulty}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {generated.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {generated.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Test Cases</h4>
                    <div className="flex flex-col gap-3">
                      {generated.testCases.map((tc, i) => (
                        <div key={i} className="rounded-lg border p-3 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">Case {i + 1}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Input: </span>
                              <code className="bg-muted px-1 rounded">{tc.input}</code>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Output: </span>
                              <code className="bg-muted px-1 rounded">{tc.output}</code>
                            </div>
                          </div>
                          {tc.explanation && (
                            <p className="text-xs text-muted-foreground mt-2">{tc.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Hint</h4>
                    <p className="text-sm text-muted-foreground">{generated.hint}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Statistics</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center rounded-lg border p-3">
                        <span className="text-2xl font-bold">{generated.statistics.acceptanceRate}</span>
                        <span className="text-xs text-muted-foreground">Acceptance</span>
                      </div>
                      <div className="flex flex-col items-center rounded-lg border p-3">
                        <span className="text-2xl font-bold">{generated.statistics.avgTime}</span>
                        <span className="text-xs text-muted-foreground">Avg Time</span>
                      </div>
                      <div className="flex flex-col items-center rounded-lg border p-3">
                        <span className="text-2xl font-bold">100</span>
                        <span className="text-xs text-muted-foreground">Submissions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
