"use client";

import {FieldArrayWithId, UseFormRegister} from "react-hook-form";
import {Plus, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {FormField} from "@/components/learning-path/form-field";
import {CodingLessonDTO} from "@/types/learning-path/schema";

interface ExamplesSectionProps {
    register: UseFormRegister<CodingLessonDTO>;
    fields: FieldArrayWithId<CodingLessonDTO, "examples", "id">[];
    onAppend: () => void;
    onRemove: (index: number) => void;
    isPending?: boolean;
}

export function ExamplesSection({
    register,
    fields,
    onAppend,
    onRemove,
    isPending,
}: ExamplesSectionProps) {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
                Show worked examples to help students understand the problem.
            </p>
            {fields.map((field, i) => (
                <div key={field.id} className="rounded-xl border border-dashed bg-card">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/20">
                        <span className="text-sm font-semibold">Example {i + 1}</span>
                        {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => onRemove(i)}
                                className="text-muted-foreground/50 hover:text-destructive"
                            >
                                <X className="w-3.5 h-3.5"/>
                            </Button>
                        )}
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <FormField label="Input" className="text-xs">
                                <textarea
                                    placeholder="[2,7,11,15], target=9"
                                    className="w-full min-h-16 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring/50"
                                    {...register(`examples.${i}.input` as const)}
                                    disabled={isPending}
                                />
                            </FormField>
                            <FormField label="Expected Output" className="text-xs">
                                <textarea
                                    placeholder="[0,1]"
                                    className="w-full min-h-16 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring/50"
                                    {...register(`examples.${i}.output` as const)}
                                    disabled={isPending}
                                />
                            </FormField>
                        </div>
                        <FormField label="Explanation (optional)" className="text-xs">
                            <Input
                                placeholder="Because nums[0] + nums[1] == 9..."
                                {...register(`examples.${i}.explanation` as const)}
                                disabled={isPending}
                            />
                        </FormField>
                    </div>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAppend}
                className="self-start"
            >
                <Plus className="w-3.5 h-3.5 mr-1.5"/>
                Add Example
            </Button>
        </div>
    );
}
