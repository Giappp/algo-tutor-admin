"use client";

import {EditorContent, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {useEffect, useMemo} from "react";
import {
    Bold,
    CheckSquare,
    Code,
    Heading2,
    Heading3,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo,
    Undo,
    Pilcrow,
    BookOpen,
    FileText,
    ListChecks,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function RichTextEditor({
                                   value,
                                   onChange,
                                   placeholder = "Write your content here...",
                                   disabled,
                                   className,
                               }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: {
                    HTMLAttributes: {class: "bg-muted rounded-lg p-4 font-mono text-sm"},
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: "is-editor-empty",
            }),
            TaskList,
            TaskItem.configure({nested: true}),
        ],
        content: value || "",
        editable: !disabled,
        onUpdate: ({editor}) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled);
        }
    }, [disabled, editor]);

    if (!editor) {
        return (
            <div className={cn("rounded-xl border border-input bg-muted animate-pulse min-h-48", className)}/>
        );
    }

    return (
        <div className={cn("flex flex-col rounded-xl border border-input overflow-hidden tiptap-editor", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 p-1.5 border-b border-border bg-muted/30 flex-wrap">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="size-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="size-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    active={editor.isActive("code")}
                    title="Inline Code"
                >
                    <Code className="size-4"/>
                </ToolbarButton>

                <Separator orientation="vertical" className="mx-1 h-5"/>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
                    active={editor.isActive("heading", {level: 2})}
                    title="Heading 2"
                >
                    <Heading2 className="size-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
                    active={editor.isActive("heading", {level: 3})}
                    title="Heading 3"
                >
                    <Heading3 className="size-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    active={editor.isActive("paragraph") && !editor.isActive("heading")}
                    title="Paragraph"
                >
                    <Pilcrow className="size-4"/>
                </ToolbarButton>

                <Separator orientation="vertical" className="mx-1 h-5"/>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    <List className="size-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    title="Numbered List"
                >
                    <ListOrdered className="size-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    active={editor.isActive("taskList")}
                    title="Task List"
                >
                    <CheckSquare className="size-4"/>
                </ToolbarButton>

                <Separator orientation="vertical" className="mx-1 h-5"/>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive("blockquote")}
                    title="Quote"
                >
                    <Quote className="size-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    active={editor.isActive("codeBlock")}
                    title="Code Block"
                >
                    <span className="text-xs font-mono font-bold">{"<>"}</span>
                </ToolbarButton>

                <Separator orientation="vertical" className="mx-1 h-5"/>

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    active={false}
                    title="Undo (Ctrl+Z)"
                    disabled={!editor.can().undo()}
                >
                    <Undo className="size-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    active={false}
                    title="Redo (Ctrl+Y)"
                    disabled={!editor.can().redo()}
                >
                    <Redo className="size-4"/>
                </ToolbarButton>
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className="tiptap-content"
            />
        </div>
    );
}

function ToolbarButton({
                           onClick,
                           active,
                           disabled,
                           title,
                           children,
                       }: {
    onClick: () => void;
    active: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "rounded-md transition-colors size-7",
                active && "bg-accent text-accent-foreground"
            )}
        >
            {children}
        </Button>
    );
}

// ---------------------------------------------------------------------------
// Content Templates
// ---------------------------------------------------------------------------

interface ContentTemplate {
    id: string;
    label: string;
    icon: React.ElementType;
    html: string;
}

const CONTENT_TEMPLATES: ContentTemplate[] = [
    {
        id: "concept",
        label: "Concept",
        icon: BookOpen,
        html: `<h2>What is [Concept]?</h2>
<p>[Brief introduction to the concept — explain what it is and why it matters in 2-3 sentences.]</p>
<h3>Key Points</h3>
<ul>
<li>[Point 1]</li>
<li>[Point 2]</li>
<li>[Point 3]</li>
</ul>
<h3>Example</h3>
<p>[Show a concrete example with code or visual representation.]</p>
<pre><code>// Your example code here</code></pre>
<h3>Summary</h3>
<p>[Recap the main takeaways and what was covered.]</p>`,
    },
    {
        id: "step-by-step",
        label: "Step-by-Step",
        icon: ListChecks,
        html: `<h2>[Topic Title]</h2>
<p>[Introduction paragraph explaining what the learner will learn.]</p>
<h3>Step 1: [Title]</h3>
<p>[Description of this step.]</p>
<pre><code>// Step 1 code</code></pre>
<h3>Step 2: [Title]</h3>
<p>[Description of this step.]</p>
<pre><code>// Step 2 code</code></pre>
<h3>Step 3: [Title]</h3>
<p>[Description of this step.]</p>
<pre><code>// Step 3 code</code></pre>
<h3>Final Result</h3>
<p>[Show the complete working example.]</p>`,
    },
    {
        id: "code-walkthrough",
        label: "Code Walkthrough",
        icon: FileText,
        html: `<h2>Code Walkthrough: [Name]</h2>
<p>[Brief description of what this code does and when to use it.]</p>
<h3>Code</h3>
<pre><code>// Your code here
function example() {
    // line by line explanation below
}
</code></pre>
<h3>Line-by-Line Breakdown</h3>
<ol>
<li><strong>[Line description]</strong> — [explanation of what this line does]</li>
<li><strong>[Line description]</strong> — [explanation of what this line does]</li>
</ol>
<h3>Time & Space Complexity</h3>
<ul>
<li><strong>Time:</strong> O(?)</li>
<li><strong>Space:</strong> O(?)</li>
</ul>
<h3>Common Pitfalls</h3>
<ul>
<li>[Pitfall 1]</li>
<li>[Pitfall 2]</li>
</ul>`,
    },
];

interface RichTextEditorWithTemplatesProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function RichTextEditorWithTemplates({
                                               value,
                                               onChange,
                                               placeholder = "Write your lesson content here...",
                                               disabled,
                                           }: RichTextEditorWithTemplatesProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: {
                    HTMLAttributes: {class: "bg-muted rounded-lg p-4 font-mono text-sm"},
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: "is-editor-empty",
            }),
            TaskList,
            TaskItem.configure({nested: true}),
        ],
        content: value || "",
        editable: !disabled,
        onUpdate: ({editor}) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled);
        }
    }, [disabled, editor]);

    const insertTemplate = (template: ContentTemplate) => {
        if (!editor) return;
        editor.commands.setContent(template.html);
        onChange(template.html);
    };

    if (!editor) {
        return (
            <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-input bg-muted animate-pulse min-h-48"/>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Template Picker */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium shrink-0">Templates:</span>
                {CONTENT_TEMPLATES.map((tpl) => {
                    const Icon = tpl.icon;
                    return (
                        <Button
                            key={tpl.id}
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => insertTemplate(tpl)}
                            disabled={disabled}
                            className="gap-1.5 text-xs h-7"
                        >
                            <Icon className="size-3.5"/>
                            {tpl.label}
                        </Button>
                    );
                })}
            </div>

            {/* Editor */}
            <RichTextEditor
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
            />

            {/* Live Preview */}
            {value && value !== "" && (
                <div className="rounded-xl border border-input overflow-hidden">
                    <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</span>
                    </div>
                    <div
                        className="tiptap-content p-4 min-h-32"
                        dangerouslySetInnerHTML={{__html: value}}
                    />
                </div>
            )}
        </div>
    );
}

interface RichTextEditorWithPreviewProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function RichTextEditorWithPreview({
                                             value,
                                             onChange,
                                             placeholder,
                                             disabled,
                                         }: RichTextEditorWithPreviewProps) {
    return (
        <RichTextEditorWithTemplates
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
}

interface RichTextDisplayProps {
    content: string;
    className?: string;
}

export function RichTextDisplay({content, className}: RichTextDisplayProps) {
    const renderedContent = useMemo(() => {
        if (!content) return null;
        return {__html: content};
    }, [content]);

    if (!content || content.trim() === "") {
        return (
            <p className="text-muted-foreground italic">No content available.</p>
        );
    }

    return (
        <div
            className={cn("tiptap-content", className)}
            dangerouslySetInnerHTML={renderedContent!}
        />
    );
}
