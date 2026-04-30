"use client";

import { GraduationCapIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearningPathForm } from "@/components/learning-path/learning-path-form";
import { LearningPathPreviewCard } from "@/components/learning-path/preview-card";
import { StepIndicator } from "@/components/learning-path/step-indicator";
import { useCreateLearningPath } from "@/hooks/use-learning-paths";
import { CreateLearningPath } from "@/types/learning-path/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CREATE_STEPS = [
  { id: "info", label: "Basic Info", description: "Name & description" },
  { id: "topics", label: "Topics", description: "Add topics & lessons" },
  { id: "review", label: "Review", description: "Review & publish" },
];

export default function CreateLearningPathPage() {
  const router = useRouter();
  const createMutation = useCreateLearningPath();
  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = async (data: CreateLearningPath) => {
    const result = await createMutation.mutateAsync(data);
    if (result?.id) {
      router.push(`/dashboard/learning-paths/${result.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
              <GraduationCapIcon className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Create Learning Path
              </h1>
              <p className="text-muted-foreground">
                Build a structured curriculum for learners to follow.
              </p>
            </div>
          </div>
          <Button variant="outline" render={<Link href="/dashboard/learning-paths" />}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        steps={CREATE_STEPS}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />

      {/* Main Content: Form + Preview */}
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <LearningPathForm
              onSubmit={handleSubmit}
              isPending={createMutation.isPending}
              submitLabel="Create Learning Path"
            />
          </CardContent>
        </Card>

        {/* Live Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">Live Preview</h3>
              <div className="h-px flex-1 bg-border" />
            </div>
            <LearningPathPreviewCard
              name="Data Structures Fundamentals"
              description="Master arrays, linked lists, trees, and graphs with hands-on coding exercises."
              level="BEGINNER"
              lessonCount={24}
              topicCount={6}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
