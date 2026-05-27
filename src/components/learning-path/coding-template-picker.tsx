"use client";

import {useState} from "react";
import {FileCode2, Sparkles} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {PROBLEM_TEMPLATES, ProblemTemplate} from "./coding-problem-templates";

interface CodingTemplatePickerProps {
    onSelect: (template: ProblemTemplate) => void;
    disabled?: boolean;
}

export function CodingTemplatePicker({onSelect, disabled}: CodingTemplatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (template: ProblemTemplate) => {
        onSelect(template);
        setIsOpen(false);
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                disabled={disabled}
                className="gap-1.5"
            >
                <Sparkles className="size-3.5"/>
                Use Template
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileCode2 className="size-5"/>
                            Problem Templates
                        </DialogTitle>
                        <DialogDescription>
                            Choose a template to pre-fill the problem statement, constraints, examples, and hints.
                            You can customize everything after selecting.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 sm:grid-cols-2 mt-4">
                        {PROBLEM_TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                type="button"
                                onClick={() => handleSelect(template)}
                                className="flex flex-col gap-2 rounded-lg border p-4 text-left transition-all hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">{template.label}</span>
                                    <Badge variant="secondary" className="text-[10px]">
                                        {template.category}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {template.description}
                                </p>
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                                    <span>{template.constraints.length} constraints</span>
                                    <span>·</span>
                                    <span>{template.examples.length} example{template.examples.length !== 1 ? "s" : ""}</span>
                                    <span>·</span>
                                    <span>{template.hints.length} hint{template.hints.length !== 1 ? "s" : ""}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
