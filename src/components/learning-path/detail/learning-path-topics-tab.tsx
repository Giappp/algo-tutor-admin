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
        <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground">
                    {topics.length} Topic{topics.length !== 1 ? "s" : ""}
                </h3>
                <Button
                    size="sm"
                    onClick={onAddTopic}
                >
                    <Plus data-icon="inline-start" className="size-4"/>
                    Add Topic
                </Button>
            </div>

            {topics.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 gap-3">
                    <p className="text-sm text-muted-foreground">No topics yet</p>
                    <Button size="sm" variant="outline" onClick={onAddTopic}>
                        <Plus data-icon="inline-start" className="size-4"/>
                        Add First Topic
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
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
