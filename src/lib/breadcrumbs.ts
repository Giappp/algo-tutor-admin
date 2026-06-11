export interface BreadcrumbItem {
  label: string
  href?: string
}

const BREADCRUMB_MAP: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [{ label: "Dashboard" }],
  "/dashboard/learning-paths": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Learning Paths" },
  ],
  "/dashboard/learning-paths/create": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Learning Paths", href: "/dashboard/learning-paths" },
    { label: "Create" },
  ],
  "/dashboard/problems": [{ label: "Dashboard", href: "/dashboard" }, { label: "Problems" }],
  "/dashboard/problems/create": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Problems", href: "/dashboard/problems" },
    { label: "Create" },
  ],
  "/dashboard/tags": [{ label: "Dashboard", href: "/dashboard" }, { label: "Tags" }],
  "/dashboard/analytics": [{ label: "Dashboard", href: "/dashboard" }, { label: "Analytics" }],
  "/dashboard/users": [{ label: "Dashboard", href: "/dashboard" }, { label: "Users" }],
  "/dashboard/models": [{ label: "Dashboard", href: "/dashboard" }, { label: "AI Models" }],
  "/dashboard/settings": [{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }],
  "/account": [{ label: "Dashboard", href: "/" }, { label: "Account" }],
  "/dashboard/playground": [{ label: "Dashboard", href: "/dashboard" }, { label: "Playground" }],
}

const DYNAMIC_PATTERNS: Array<{ pattern: RegExp; build: (matches: string[]) => BreadcrumbItem[] }> = [
  {
    pattern: /^\/dashboard\/learning-paths\/(\d+)$/,
    build: () => [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Learning Paths", href: "/dashboard/learning-paths" },
      { label: "Details" },
    ],
  },
  {
    pattern: /^\/dashboard\/learning-paths\/(\d+)\/lessons\/(\d+)$/,
    build: () => [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Learning Paths", href: "/dashboard/learning-paths" },
      { label: "Lesson" },
    ],
  },
  {
    pattern: /^\/dashboard\/learning-paths\/(\d+)\/topics\/(\d+)\/lessons\/create$/,
    build: (matches) => [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Learning Paths", href: "/dashboard/learning-paths" },
      { label: "Details", href: `/dashboard/learning-paths/${matches[1]}` },
      { label: "Add Lesson" },
    ],
  },
  {
    pattern: /^\/dashboard\/problems\/([^/]+)$/,
    build: () => [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Problems", href: "/dashboard/problems" },
      { label: "Edit" },
    ],
  },
  {
    pattern: /^\/dashboard\/users\/([^/]+)$/,
    build: (matches) => [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Users", href: "/dashboard/users" },
      { label: matches[1] ?? "Details" },
    ],
  },
]

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (BREADCRUMB_MAP[pathname]) {
    return BREADCRUMB_MAP[pathname]
  }

  for (const { pattern, build } of DYNAMIC_PATTERNS) {
    const match = pathname.match(pattern)
    if (match) {
      return build(match)
    }
  }

  const segments = pathname.split("/").filter(Boolean)
  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
    return { label, href }
  })
}
