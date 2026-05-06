import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {TopicAccordionItem} from "./topic-accordion-item";
import {Topic} from "@/types/learning-path";

interface LearningPathTopicsTabProps {
    topics: Topic[];
    pathId: number;
    onAddTopic: () => void;
}

export function LearningPathTopicsTab({
                                          topics,
                                          pathId,
                                          onAddTopic,
                                      }: LearningPathTopicsTabProps) {
    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Topics
                    </h3>
                    {/* Gradient underline */}
                    <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-chart-1/40 via-chart-2/20 to-transparent rounded-full" />
                </div>
                <Button
                    size="sm"
                    variant={"outline"}
                    onClick={onAddTopic}
                    className="gap-1.5 bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white shadow-md shadow-chart-1/20 font-medium transition-all border-0"
                >
                    <Plus className="size-4"/>
                    Add Topic
                </Button>
            </div>

            {topics.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-chart-1/20 bg-gradient-to-b from-chart-1/5 to-transparent py-16 gap-4">
                    {/* Decorative icon */}
                    <div
                        className="relative">
                        <div
                            className="flex items-center justify-center size-14 rounded-2xl bg-chart-1/10 border border-chart-1/25">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="1.75" className="text-chart-1">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                <path d="M12 6v8M8 10h8"/>
                            </svg>
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -top-1 -right-1 size-5 rounded-full bg-chart-5 border-2 border-card flex items-center justify-center">
                            <Plus className="size-3 text-chart-5-foreground" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-foreground">No topics yet</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                            Add your first topic to start building this learning path.
                        </p>
                    </div>
                    <Button size="sm" onClick={onAddTopic}
                            className="gap-1.5 bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white shadow-md shadow-chart-1/20 font-medium transition-all border-0">
                        <Plus className="size-4"/>
                        Add First Topic
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-3 stagger-children">
                    {topics.map((topic: Topic) => (
                        <TopicAccordionItem
                            key={topic.id}
                            topic={topic}
                            pathId={pathId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
