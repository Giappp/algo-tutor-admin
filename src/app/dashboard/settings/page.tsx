"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { CodeIcon, SaveIcon, GlobeIcon, PaletteIcon, BellIcon, KeyIcon } from "lucide-react"

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("AlgoTutor")
  const [siteDescription, setSiteDescription] = useState("AI-powered algorithm tutoring platform")
  const [apiUrl, setApiUrl] = useState("https://api.algotutor.edu")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your platform settings and configurations.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="flex flex-col gap-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>Basic information about your platform.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor="site-name">Site Name</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="site-name"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                    />
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel htmlFor="site-description">Description</FieldLabel>
                  <Textarea
                    id="site-description"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    rows={3}
                  />
                  <FieldDescription>The description shown on your landing page.</FieldDescription>
                </Field>
                <div className="flex justify-end pt-2">
                  <Button>
                    <SaveIcon data-icon="inline-start" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <div className="flex flex-col gap-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Configure backend API endpoints.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor="api-url">Backend API URL</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="api-url"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://api.example.com"
                    />
                  </InputGroup>
                  <FieldDescription>The base URL for all backend API requests.</FieldDescription>
                </Field>
                <Separator />
                <Field>
                  <FieldLabel>API Keys</FieldLabel>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <KeyIcon className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Production Key</p>
                        <p className="text-xs text-muted-foreground">Last used: 2 hours ago</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Rotate</Button>
                  </div>
                </Field>
                <div className="flex justify-end pt-2">
                  <Button>
                    <SaveIcon data-icon="inline-start" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <div className="flex flex-col gap-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Field>
                  <FieldLabel>Theme</FieldLabel>
                  <div className="flex gap-2">
                    <Button variant="outline">Light</Button>
                    <Button variant="default">System</Button>
                    <Button variant="outline">Dark</Button>
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Accent Color</FieldLabel>
                  <div className="flex gap-2">
                    <div className="size-8 rounded-full bg-orange-500 ring-2 ring-offset-2 cursor-pointer" />
                    <div className="size-8 rounded-full bg-blue-500 cursor-pointer" />
                    <div className="size-8 rounded-full bg-green-500 cursor-pointer" />
                    <div className="size-8 rounded-full bg-purple-500 cursor-pointer" />
                  </div>
                </Field>
                <div className="flex justify-end pt-2">
                  <Button>
                    <SaveIcon data-icon="inline-start" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="flex flex-col gap-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive updates via email.</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive browser push notifications.</p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
                <Separator />
                <Field>
                  <FieldLabel>Daily Digest</FieldLabel>
                  <FieldDescription>Receive a daily summary of platform activity.</FieldDescription>
                </Field>
                <div className="flex justify-end pt-2">
                  <Button>
                    <SaveIcon data-icon="inline-start" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
