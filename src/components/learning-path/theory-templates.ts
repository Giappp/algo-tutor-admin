import type {ElementType} from "react";
import {BookOpen, FileText, ListChecks} from "lucide-react";

export interface TheoryTemplate {
    id: string;
    label: string;
    description: string;
    icon: ElementType;
    content: string;
}

export const THEORY_TEMPLATES: TheoryTemplate[] = [
    {
        id: "concept",
        label: "Concept",
        description: "Explain an idea, example, and takeaway.",
        icon: BookOpen,
        content: `## What is [Concept]?

[Brief introduction to the concept and why it matters.]

### Key points

- [Point 1]
- [Point 2]
- [Point 3]

### Example

\`\`\`java
// Your example code
\`\`\`

### Summary

[Recap the main takeaway.]`,
    },
    {
        id: "step-by-step",
        label: "Step by step",
        description: "Guide learners through a process.",
        icon: ListChecks,
        content: `## [Topic title]

[What the learner will accomplish.]

### Step 1: [Title]

[Description and code.]

### Step 2: [Title]

[Description and code.]

### Final result

[Show the complete result.]`,
    },
    {
        id: "code-walkthrough",
        label: "Code walkthrough",
        description: "Break down an implementation.",
        icon: FileText,
        content: `## Code walkthrough: [Name]

[What the code does and when to use it.]

### Code

\`\`\`java
// Your code
\`\`\`

### Breakdown

1. **[Part]** - [Explanation]
2. **[Part]** - [Explanation]

### Complexity

- **Time:** O(?)
- **Space:** O(?)`,
    },
];
