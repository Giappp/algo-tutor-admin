"use client";

import ReactMarkdown, {Components} from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneDark} from "react-syntax-highlighter/dist/esm/styles/prism";
import {cn} from "@/lib/utils";

interface MarkdownDisplayProps {
    content: string;
    className?: string;
}

const components: Components = {
    h1: ({children, ...props}) => (
        <h1 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-border first:mt-0" {...props}>
            {children}
        </h1>
    ),
    h2: ({children, ...props}) => (
        <h2 className="text-xl font-semibold mt-7 mb-3 pb-1.5 border-b border-border/50 first:mt-0" {...props}>
            {children}
        </h2>
    ),
    h3: ({children, ...props}) => (
        <h3 className="text-lg font-semibold mt-5 mb-2 first:mt-0" {...props}>
            {children}
        </h3>
    ),
    h4: ({children, ...props}) => (
        <h4 className="text-base font-semibold mt-4 mb-2 first:mt-0" {...props}>
            {children}
        </h4>
    ),
    p: ({children, ...props}) => (
        <p className="mb-4 leading-7 last:mb-0" {...props}>
            {children}
        </p>
    ),
    ul: ({children, ...props}) => (
        <ul className="mb-4 ml-6 list-disc space-y-1.5 [&>li]:leading-7" {...props}>
            {children}
        </ul>
    ),
    ol: ({children, ...props}) => (
        <ol className="mb-4 ml-6 list-decimal space-y-1.5 [&>li]:leading-7" {...props}>
            {children}
        </ol>
    ),
    li: ({children, ...props}) => (
        <li className="leading-7" {...props}>
            {children}
        </li>
    ),
    blockquote: ({children, ...props}) => (
        <blockquote
            className="mb-4 border-l-4 border-primary/30 bg-muted/40 pl-4 py-2 italic text-muted-foreground [&>p]:mb-2 [&>p:last-child]:mb-0"
            {...props}
        >
            {children}
        </blockquote>
    ),
    hr: (props) => (
        <hr className="my-6 border-border" {...props} />
    ),
    a: ({children, href, ...props}) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            {...props}
        >
            {children}
        </a>
    ),
    strong: ({children, ...props}) => (
        <strong className="font-semibold text-foreground" {...props}>
            {children}
        </strong>
    ),
    em: ({children, ...props}) => (
        <em className="italic" {...props}>
            {children}
        </em>
    ),
    table: ({children, ...props}) => (
        <div className="mb-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm" {...props}>
                {children}
            </table>
        </div>
    ),
    thead: ({children, ...props}) => (
        <thead className="bg-muted/60 border-b border-border" {...props}>
            {children}
        </thead>
    ),
    th: ({children, ...props}) => (
        <th className="px-4 py-2.5 text-left font-semibold text-foreground" {...props}>
            {children}
        </th>
    ),
    td: ({children, ...props}) => (
        <td className="px-4 py-2.5 border-t border-border/50" {...props}>
            {children}
        </td>
    ),
    tr: ({children, ...props}) => (
        <tr className="hover:bg-muted/30 transition-colors" {...props}>
            {children}
        </tr>
    ),
    img: ({src, alt, ...props}) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt || ""}
            className="mb-4 rounded-lg border border-border max-w-full h-auto"
            loading="lazy"
            {...props}
        />
    ),
    code: ({children, className, ...props}) => {
        const match = /language-(\w+)/.exec(className || "");
        const isInline = !match;

        if (isInline) {
            return (
                <code
                    className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground border border-border/50"
                    {...props}
                >
                    {children}
                </code>
            );
        }

        const language = match[1];

        return (
            <div className="mb-4 overflow-hidden rounded-lg border border-border">
                <div className="flex items-center justify-between bg-muted/80 px-4 py-2 border-b border-border">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {language}
                    </span>
                </div>
                <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        padding: "1rem",
                        fontSize: "0.875rem",
                        lineHeight: "1.6",
                    }}
                >
                    {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
            </div>
        );
    },
    pre: ({children}) => <>{children}</>,
    input: ({type, checked, ...props}) => {
        if (type === "checkbox") {
            return (
                <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="mr-2 rounded border-border"
                    {...props}
                />
            );
        }
        return <input type={type} {...props} />;
    },
};

export function MarkdownDisplay({content, className}: MarkdownDisplayProps) {
    if (!content || content.trim() === "") {
        return (
            <p className="text-muted-foreground italic">No content available.</p>
        );
    }

    return (
        <div className={cn("prose-custom text-foreground text-sm", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeSlug]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
