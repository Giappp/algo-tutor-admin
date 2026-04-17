"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import {
  SearchIcon,
  MoreHorizontalIcon,
  BanIcon,
  CheckCircleIcon,
  ShieldIcon,
  TrashIcon,
  DownloadIcon,
} from "lucide-react"

const mockUsers = [
  {
    id: "1",
    name: "Alice Chen",
    email: "alice@example.com",
    role: "Admin",
    status: "active",
    problems: 24,
    createdAt: "2024-01-15",
    avatar: "https://github.com/alice.png",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Editor",
    status: "active",
    problems: 12,
    createdAt: "2024-02-20",
    avatar: "https://github.com/bob.png",
  },
  {
    id: "3",
    name: "Charlie Lee",
    email: "charlie@example.com",
    role: "Viewer",
    status: "inactive",
    problems: 0,
    createdAt: "2024-03-10",
    avatar: "https://github.com/charlie.png",
  },
  {
    id: "4",
    name: "Diana Martinez",
    email: "diana@example.com",
    role: "Editor",
    status: "active",
    problems: 8,
    createdAt: "2024-04-05",
    avatar: "https://github.com/diana.png",
  },
  {
    id: "5",
    name: "Evan Wilson",
    email: "evan@example.com",
    role: "Viewer",
    status: "active",
    problems: 3,
    createdAt: "2024-05-12",
    avatar: "https://github.com/evan.png",
  },
]

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case "Admin":
      return "default"
    case "Editor":
      return "secondary"
    default:
      return "outline"
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "default"
    case "inactive":
      return "secondary"
    case "banned":
      return "destructive"
    default:
      return "outline"
  }
}

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage platform users and permissions.</p>
        </div>
        <Button variant="outline">
          <DownloadIcon data-icon="inline-start" />
          Export
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <InputGroup className="w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <InputGroupInput
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </InputGroup>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Problems</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role) as "default" | "secondary" | "outline" | "destructive" | null | undefined}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.status) as "default" | "secondary" | "outline" | "destructive" | null | undefined}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.problems}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{user.createdAt}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" className="size-8 p-0" />}>
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <ShieldIcon data-icon="inline-start" />
                          Change Role
                        </DropdownMenuItem>
                        {user.status === "active" ? (
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <BanIcon data-icon="inline-start" />
                            Disable User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <CheckCircleIcon data-icon="inline-start" />
                            Enable User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <TrashIcon data-icon="inline-start" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
