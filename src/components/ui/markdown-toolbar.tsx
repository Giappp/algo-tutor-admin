"use client";

import {useRef} from "react";
import {useTranslations} from "next-intl";
import {
    Bold,
    Code,
    Columns2,
    FunctionSquare,
    ImageIcon,
    Italic,
    Link,
    Loader2,
    Table,
    Terminal,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InsertAction {
    /** Text to insert before the cursor/selection */
    before: string;
    /** Text to insert after the cursor/selection */
    after: string;
    /** Placeholder text if nothing is selected */
    placeholder?: string;
}

export interface MarkdownToolbarProps {
    onInsert: (action: InsertAction) => void;
    disabled?: boolean;
    className?: string;
    onImageFile?: (file: File) => void;
    isUploadingImage?: boolean;
}

// ---------------------------------------------------------------------------
// Toolbar Items
// ---------------------------------------------------------------------------

interface ToolbarItem {
    id: string;
    label: string;
    icon: React.ElementType;
    action: InsertAction;
}

interface ToolbarGroup {
    id: string;
    items: ToolbarItem[];
}

const TOOLBAR_GROUPS: ToolbarGroup[] = [
    {
        id: "text",
        items: [
            {
                id: "bold",
                label: "Bold",
                icon: Bold,
                action: {before: "**", after: "**", placeholder: "bold text"},
            },
            {
                id: "italic",
                label: "Italic",
                icon: Italic,
                action: {before: "_", after: "_", placeholder: "italic text"},
            },
        ],
    },
    {
        id: "code",
        items: [
            {
                id: "inline-code",
                label: "Inline Code",
                icon: Code,
                action: {before: "`", after: "`", placeholder: "code"},
            },
            {
                id: "code-block",
                label: "Code Block",
                icon: Terminal,
                action: {before: "```java\n", after: "\n```", placeholder: "// your code here"},
            },
        ],
    },
    {
        id: "math",
        items: [
            {
                id: "math-inline",
                label: "Math Inline",
                icon: FunctionSquare,
                action: {before: "$", after: "$", placeholder: "x^2"},
            },
            {
                id: "math-block",
                label: "Math Block",
                icon: Columns2,
                action: {before: "$$\n", after: "\n$$", placeholder: "\\sum_{i=1}^{n} i"},
            },
        ],
    },
    {
        id: "blocks",
        items: [
            {
                id: "table",
                label: "Table",
                icon: Table,
                action: {
                    before: "",
                    after: "",
                    placeholder:
                        "| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Cell 1   | Cell 2   | Cell 3   |",
                },
            },
            {
                id: "link",
                label: "Link",
                icon: Link,
                action: {before: "[", after: "](url)", placeholder: "link text"},
            },
        ],
    },
];

// ---------------------------------------------------------------------------
// Snippet buttons (non-standard items)
// ---------------------------------------------------------------------------

const SAMPLE_IO_SNIPPET = `**Input:**
\`\`\`
[input here]
\`\`\`

**Output:**
\`\`\`
[output here]
\`\`\`

**Explanation:** [explain here]`;

const CONSTRAINT_SNIPPET = `**Constraints:**
- $1 \\leq n \\leq 10^5$
- $1 \\leq a_i \\leq 10^9$`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MarkdownToolbar({
    onInsert,
    disabled,
    className,
    onImageFile,
    isUploadingImage,
}: MarkdownToolbarProps) {
    const t = useTranslations("lessonForm");
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className={cn(
                "flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto px-2 py-1.5",
                className
            )}
            role="toolbar"
            aria-label={t("markdown.formattingToolbar")}
        >
            {TOOLBAR_GROUPS.map((group, gi) => (
                <div key={group.id} className="flex items-center gap-0.5">
                    {gi > 0 && <Separator orientation="vertical" className="mx-1.5 h-5"/>}
                    {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={item.id}
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                title={t(`markdown.toolbar.${item.id}`)}
                                aria-label={t(`markdown.toolbar.${item.id}`)}
                                disabled={disabled}
                                onClick={() => onInsert(item.action)}
                                className="size-7 rounded-md"
                            >
                                <Icon className="size-3.5"/>
                            </Button>
                        );
                    })}
                </div>
            ))}

            <Separator orientation="vertical" className="mx-1.5 h-5"/>

            {/* Image upload */}
            <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                title={t("markdown.toolbar.uploadImage")}
                aria-label={t("markdown.toolbar.uploadImage")}
                disabled={disabled || isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="size-7 rounded-md text-primary"
            >
                {isUploadingImage
                    ? <Loader2 className="size-3.5 animate-spin"/>
                    : <ImageIcon className="size-3.5"/>}
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onImageFile?.(file);
                    event.target.value = "";
                }}
                className="hidden"
            />

            <Separator orientation="vertical" className="mx-1.5 h-5"/>

            {/* Snippet buttons */}
            <Button
                type="button"
                variant="ghost"
                size="xs"
                title={t("markdown.toolbar.sampleIo")}
                disabled={disabled}
                onClick={() => onInsert({before: SAMPLE_IO_SNIPPET, after: "", placeholder: ""})}
                className="h-7 px-2 text-[11px] font-medium text-muted-foreground"
            >
                {t("markdown.toolbar.sampleIoShort")}
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="xs"
                title={t("markdown.toolbar.constraints")}
                disabled={disabled}
                onClick={() => onInsert({before: CONSTRAINT_SNIPPET, after: "", placeholder: ""})}
                className="h-7 px-2 text-[11px] font-medium text-muted-foreground"
            >
                {t("markdown.toolbar.constraintsShort")}
            </Button>
        </div>
    );
}
