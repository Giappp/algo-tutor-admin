"use client";

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    badge?: number;
    children: React.ReactNode;
}

export function TabButton({active, onClick, badge, children}: TabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${active
                ? "bg-background text-foreground shadow-sm border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }
            `}
        >
            {children}
            {badge !== undefined && badge > 0 && (
                <span className="inline-flex items-center justify-center size-4 rounded-full bg-muted text-[9px] font-bold">
                    {badge}
                </span>
            )}
        </button>
    );
}
