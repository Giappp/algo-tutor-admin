"use client"

import React, { useState } from "react"
import Link from "next/link"

import { useArchiveProblem, useProblemsList, useUnarchiveProblem } from "@/hooks/use-problems"
import { ProblemStatus } from "@/types/problem"
import { toAppError } from "@/api/core/api-error"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PenIcon,
  PlusIcon,
} from "lucide-react"

export default function ProblemsListPage() {
  const [page, setPage] = useState(0)
  const size = 20

  const { data: pageData, isLoading, isError, error } = useProblemsList({ page, size })
  const archiveProblem = useArchiveProblem()
  const unarchiveProblem = useUnarchiveProblem()

  const getStatusBadge = (status: ProblemStatus) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge variant="default">Published</Badge>
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "ARCHIVED":
        return <Badge variant="destructive">Archived</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return <Badge variant="outline">EASY</Badge>
      case "MEDIUM":
        return <Badge variant="outline">MEDIUM</Badge>
      case "HARD":
        return <Badge variant="outline">HARD</Badge>
      default:
        return <Badge variant="outline">{difficulty}</Badge>
    }
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        {toAppError(error).message}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Problems</h1>
          <p className="text-muted-foreground">Manage your algorithmic problems.</p>
        </div>
        <Button render={<Link href="/dashboard/problems/create" />}>
            <PlusIcon data-icon="inline-start" />
            Create Problem
        </Button>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Title/Slug</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2Icon className="size-6 mx-auto animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : pageData?.data === undefined || pageData.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <FileTextIcon className="size-6 text-muted-foreground" data-icon="inline-center" />
                    </div>
                    <div className="text-lg font-medium">No problems found</div>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      It seems like there are no problems yet. Get started by creating your first
                      algorithmic problem.
                    </p>
                    <div className="pt-2">
                      <Button render={<Link href="/dashboard/problems/create" />} variant="outline">
                        <PlusIcon data-icon="inline-start" />
                        Create Problem
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pageData.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">#{item.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.slug}</div>
                  </TableCell>
                  <TableCell>{getDifficultyBadge(item.difficulty)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{item.tags.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                  <DropdownMenuTrigger
                        render={<Button variant="ghost" className="size-8 p-0" />}
                  >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontalIcon data-icon="inline-end" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem render={<Link href={`/dashboard/problems/${item.id}`} />}>
                            <PenIcon data-icon="inline-start" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {item.status !== "ARCHIVED" ? (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => archiveProblem.mutate(item.id)}
                            >
                              <ArchiveIcon data-icon="inline-start" />
                              Archive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => unarchiveProblem.mutate(item.id)}>
                              <ArchiveRestoreIcon data-icon="inline-start" />
                              Unarchive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pageData && pageData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageData.currentPage * pageData.pageSize + 1} to{" "}
            {Math.min((pageData.currentPage + 1) * pageData.pageSize, pageData.totalElements)} of{" "}
            {pageData.totalElements} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((old) => Math.max(0, old - 1))}
              disabled={page === 0}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((old) => (old + 1 < pageData.totalPages ? old + 1 : old))}
              disabled={page >= pageData.totalPages - 1}
            >
              Next
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
