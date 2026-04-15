"use client";

import React, {use} from "react";

import Link from "next/link";

import {useProblemDetail, usePublishProblem} from "@/hooks/use-problem";
import {toAppError} from "@/api/core/api-error";

import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ChevronLeftIcon, Loader2Icon, RocketIcon} from "lucide-react";

import {BasicInfoTab} from "@/components/problem/edit/basic-info-tab";
import {TestCasesTab} from "@/components/problem/edit/test-cases-tab";
import {EditorialTab} from "@/components/problem/edit/editorial-tab";
import {AiContextTab} from "@/components/problem/edit/ai-context-tab";

export default function ProblemEditPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const problemId = parseInt(params.id, 10);

    const {data: problem, isLoading, isError, error} = useProblemDetail(problemId);
    const publishProblem = usePublishProblem(problemId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2Icon className="w-8 h-8 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    if (isError || !problem) {
        return (
            <div className="flex items-center justify-center p-24 text-destructive">
                {toAppError(error).message}
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button nativeButton={false} variant="ghost" size="icon"
                            render={<Link href="/dashboard/problems"/>}>
                        <ChevronLeftIcon className="w-4 h-4"/>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{problem.title}</h1>
                            {problem.status === 'PUBLISHED' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500">Published</Badge>
                            ) : problem.status === 'ARCHIVED' ? (
                                <Badge variant="destructive"
                                       className="bg-destructive/10 text-destructive">Archived</Badge>
                            ) : (
                                <Badge variant="secondary">Draft</Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono mt-1">/{problem.slug}</p>
                    </div>
                </div>

                {problem.status !== 'PUBLISHED' && problem.status !== 'ARCHIVED' && (
                    <Button onClick={() => publishProblem.mutate()} disabled={publishProblem.isPending}>
                        {publishProblem.isPending ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin"/> :
                            <RocketIcon className="w-4 h-4 mr-2"/>}
                        Publish Problem
                    </Button>
                )}
            </div>

            <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="bg-muted text-muted-foreground p-1">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="testcases">Test Cases & Solution</TabsTrigger>
                    <TabsTrigger value="editorial">Editorials</TabsTrigger>
                    <TabsTrigger value="ai">AI Context</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="m-0 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <BasicInfoTab problem={problem}/>
                </TabsContent>

                <TabsContent value="testcases" className="m-0 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <TestCasesTab problem={problem}/>
                </TabsContent>

                <TabsContent value="editorial" className="m-0 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <EditorialTab problem={problem}/>
                </TabsContent>

                <TabsContent value="ai" className="m-0 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <AiContextTab problem={problem}/>
                </TabsContent>
            </Tabs>
        </div>
    );
}
