export interface BreadcrumbItem {
  label: string
  href?: string
}

const BREADCRUMB_MAP: Record<string, BreadcrumbItem[]> = {
  "/": [{ label: "Dashboard" }],
  "/learning-paths": [
    { label: "Dashboard", href: "/" },
    { label: "Learning Paths" },
  ],
  "/learning-paths/create": [
    { label: "Dashboard", href: "/" },
    { label: "Learning Paths", href: "/learning-paths" },
    { label: "Create" },
  ],
  "/users": [{ label: "Dashboard", href: "/" }, { label: "Users" }],
  "/models": [{ label: "Dashboard", href: "/" }, { label: "AI Models" }],
  "/settings": [{ label: "Dashboard", href: "/" }, { label: "Settings" }],
  "/account": [{ label: "Dashboard", href: "/" }, { label: "Account" }],
}

const DYNAMIC_PATTERNS: Array<{ pattern: RegExp; build: (matches: string[]) => BreadcrumbItem[] }> = [
  {
    pattern: /^\/learning-paths\/(\d+)$/,
    build: () => [
      { label: "Dashboard", href: "/" },
      { label: "Learning Paths", href: "/learning-paths" },
      { label: "Details" },
    ],
  },
  {
    pattern: /^\/learning-paths\/(\d+)\/lessons\/(\d+)$/,
    build: () => [
      { label: "Dashboard", href: "/" },
      { label: "Learning Paths", href: "/learning-paths" },
      { label: "Lesson" },
    ],
  },
  {
    pattern: /^\/learning-paths\/(\d+)\/topics\/(\d+)\/lessons\/create$/,
    build: (matches) => [
      { label: "Dashboard", href: "/" },
      { label: "Learning Paths", href: "/learning-paths" },
      { label: "Details", href: `/learning-paths/${matches[1]}` },
      { label: "Add Lesson" },
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
