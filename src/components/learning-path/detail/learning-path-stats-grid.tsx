import {BookMarked, LayoutGrid, Rocket, Users} from "lucide-react";

interface StatItem {
    label: string;
    value: number;
    icon: React.ElementType;
    accentColor: {
        bg: string;
        icon: string;
        border: string;
        strip: string;
    };
}

interface LearningPathStatsGridProps {
    topicCount: number;
    totalLessonCount: number;
    publishedLessonCount: number;
    enrollmentCount: number;
}

const STAT_CONFIG: Omit<StatItem, "label" | "value">[] = [
    {
        icon: LayoutGrid,
        accentColor: {
            bg: "bg-chart-1/10",
            icon: "text-chart-1",
            border: "border-chart-1/20",
            strip: "bg-gradient-to-b from-chart-1 to-chart-1/40",
        },
    },
    {
        icon: BookMarked,
        accentColor: {
            bg: "bg-chart-2/10",
            icon: "text-chart-2",
            border: "border-chart-2/20",
            strip: "bg-gradient-to-b from-chart-2 to-chart-2/40",
        },
    },
    {
        icon: Rocket,
        accentColor: {
            bg: "bg-chart-3/10",
            icon: "text-chart-3",
            border: "border-chart-3/20",
            strip: "bg-gradient-to-b from-chart-3 to-chart-3/40",
        },
    },
    {
        icon: Users,
        accentColor: {
            bg: "bg-chart-5/10",
            icon: "text-chart-5",
            border: "border-chart-5/20",
            strip: "bg-gradient-to-b from-chart-5 to-chart-5/40",
        },
    },
];

export function LearningPathStatsGrid({
                                         topicCount,
                                         totalLessonCount,
                                         publishedLessonCount,
                                         enrollmentCount,
                                     }: LearningPathStatsGridProps) {
    const stats: [string, number][] = [
        ["Topics", topicCount],
        ["Total Lessons", totalLessonCount],
        ["Published", publishedLessonCount],
        ["Enrollments", enrollmentCount],
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
            {stats.map(([label, value], i) => {
                const cfg = STAT_CONFIG[i];
                const Icon = cfg.icon;
                return (
                    <div
                        key={label}
                        className="relative flex items-center gap-3 p-4 rounded-2xl border bg-card overflow-hidden card-lift group"
                    >
                        {/* Left accent strip */}
                        <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${cfg.accentColor.strip} shadow-sm`} />

                        <div className={`shrink-0 flex items-center justify-center size-11 rounded-xl border ${cfg.accentColor.bg} ${cfg.accentColor.icon} ${cfg.accentColor.border} ml-1.5 group-hover:scale-110 transition-transform duration-200`}>
                            <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground truncate font-medium">{label}</p>
                            <p className="text-2xl font-heading font-bold text-foreground tabular-nums tracking-tight">{value}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
