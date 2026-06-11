"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Check, RefreshCw, PlusCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { QuestionRequestDTO } from "@/types/learning-path/schema";

interface AIQuestionGeneratorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddQuestions: (questions: QuestionRequestDTO[]) => Promise<void>;
    isPending: boolean;
}

const PRESET_TOPICS = [
    "Arrays & Hashing",
    "Linked Lists",
    "Trees & Graphs",
    "Dynamic Programming",
    "Recursion & Backtracking",
    "Sorting & Searching",
];

const MOCK_QUESTIONS_POOL: Record<string, Record<string, QuestionRequestDTO[]>> = {
    "Arrays & Hashing": {
        "EASY": [
            {
                question: "What is the time complexity of looking up an element in a Hash Map in the average case?",
                type: "SINGLE_CHOICE",
                points: 1,
                explanation: "Hash maps use hashing to map keys to indexes. In the average case, with a good hash function, lookup is O(1). In the worst case, if all keys hash to the same bucket, it could become O(N).",
                choices: [
                    { text: "O(1)", isCorrect: true, explanation: "Correct. Average case hash table lookup is constant time." },
                    { text: "O(log N)", isCorrect: false, explanation: "O(log N) is typically for balanced BST lookups." },
                    { text: "O(N)", isCorrect: false, explanation: "O(N) is the worst-case lookup time if collision occurs frequently." },
                    { text: "O(N log N)", isCorrect: false, explanation: "O(N log N) is standard sorting time complexity." },
                ]
            },
            {
                question: "Which of the following data structures has a fixed size upon initialization?",
                type: "SINGLE_CHOICE",
                points: 1,
                explanation: "Standard arrays have a fixed size defined at the time of creation. Dynamic arrays (like ArrayList in Java) can grow dynamically.",
                choices: [
                    { text: "Static Array", isCorrect: true, explanation: "Correct. Static arrays cannot be resized after allocation." },
                    { text: "Linked List", isCorrect: false, explanation: "Linked lists allocate memory dynamically for new nodes." },
                    { text: "Hash Map", isCorrect: false, explanation: "Hash maps dynamically resize themselves when they exceed their load factor." },
                    { text: "Queue", isCorrect: false, explanation: "Queues can grow dynamically based on the underlying structure." },
                ]
            }
        ],
        "MEDIUM": [
            {
                question: "What is the worst-case time complexity of inserting a key into a Hash Map when collisions are handled via Chaining?",
                type: "SINGLE_CHOICE",
                points: 2,
                explanation: "In the absolute worst case, all N keys hash to the same index. We must traverse the chain of length N to insert, leading to O(N) complexity.",
                choices: [
                    { text: "O(1)", isCorrect: false, explanation: "O(1) is the average insertion time." },
                    { text: "O(log N)", isCorrect: false, explanation: "Balanced trees achieve O(log N) insertion, not chaining." },
                    { text: "O(N)", isCorrect: true, explanation: "Correct. Worst-case is O(N) if all elements hash to the same bucket." },
                    { text: "O(N^2)", isCorrect: false, explanation: "Insertion does not require quadratic time." },
                ]
            }
        ]
    },
    "Linked Lists": {
        "EASY": [
            {
                question: "What is the time complexity to insert a new node at the head of a Singly Linked List?",
                type: "SINGLE_CHOICE",
                points: 1,
                explanation: "Inserting at the head only requires creating the node, pointing its next pointer to the current head, and updating the head pointer. This takes constant time, O(1).",
                choices: [
                    { text: "O(1)", isCorrect: true, explanation: "Correct. Node insertion at the front of a linked list is a constant time operation." },
                    { text: "O(N)", isCorrect: false, explanation: "No traversal is needed to insert at the head." },
                    { text: "O(log N)", isCorrect: false, explanation: "O(log N) operations require hierarchical trees or binary search." },
                    { text: "O(1) or O(N) depending on tail pointer", isCorrect: false, explanation: "Inserting at head never depends on the tail pointer." },
                ]
            }
        ]
    }
};

const DEFAULT_POOL: QuestionRequestDTO[] = [
    {
        question: "What is the primary benefit of dynamic programming compared to standard recursion?",
        type: "SINGLE_CHOICE",
        points: 2,
        explanation: "Dynamic programming avoids redundant computations of overlapping subproblems by caching/memoizing intermediate results, saving time at the expense of memory.",
        choices: [
            { text: "It reduces time complexity by caching overlapping subproblem results", isCorrect: true, explanation: "Correct. This technique is called memoization or tabulation." },
            { text: "It uses less memory than recursion", isCorrect: false, explanation: "DP usually uses MORE memory to store lookup tables." },
            { text: "It is always easier to implement", isCorrect: false, explanation: "DP is often harder to model than simple recursion." },
            { text: "It works on all recursive problems", isCorrect: false, explanation: "It only works if problems have optimal substructure and overlapping subproblems." },
        ]
    },
    {
        question: "Which of the following algorithms is used to find the shortest path in a weighted graph with non-negative edge weights?",
        type: "SINGLE_CHOICE",
        points: 2,
        explanation: "Dijkstra's algorithm is specifically designed for single-source shortest path finding on graphs with non-negative weights.",
        choices: [
            { text: "Dijkstra's Algorithm", isCorrect: true, explanation: "Correct. Dijkstra finds the shortest path efficiently when edge weights are >= 0." },
            { text: "Kruskal's Algorithm", isCorrect: false, explanation: "Kruskal's is used to find Minimum Spanning Trees (MST)." },
            { text: "Prim's Algorithm", isCorrect: false, explanation: "Prim's is used to find Minimum Spanning Trees (MST)." },
            { text: "Depth-First Search (DFS)", isCorrect: false, explanation: "DFS finds paths, but not necessarily shortest paths in weighted graphs." },
        ]
    }
];

export function AIQuestionGeneratorDialog({
    open,
    onOpenChange,
    onAddQuestions,
    isPending,
}: AIQuestionGeneratorDialogProps) {
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
    const [count, setCount] = useState<number>(3);
    const [generating, setGenerating] = useState(false);
    const [loadingStage, setLoadingStage] = useState(0);
    const [generatedQuestions, setGeneratedQuestions] = useState<(QuestionRequestDTO & { selected: boolean })[]>([]);

    const loadingStages = [
        "Connecting to AI Tutor model...",
        "Analyzing topic guidelines and syllabus context...",
        "Generating conceptual question stems...",
        "Formulating realistic distractor options...",
        "Drafting comprehensive feedback and explanations...",
        "Finalizing questions structure..."
    ];

    // Cycle through loading stages for realistic AI effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (generating) {
            interval = setInterval(() => {
                setLoadingStage((prev) => {
                    if (prev < loadingStages.length - 1) {
                        return prev + 1;
                    }
                    return prev;
                });
            }, 1200);
        }
        return () => clearInterval(interval);
    }, [generating, loadingStages.length]);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error("Please enter a topic or select one from the presets");
            return;
        }

        setGenerating(true);
        setLoadingStage(0);
        setGeneratedQuestions([]);

        // Simulate network delay for AI model generation
        setTimeout(() => {
            // Find in pool
            let foundQuestions: QuestionRequestDTO[] = [];
            const key = PRESET_TOPICS.find(t => t.toLowerCase() === topic.toLowerCase()) || "";
            if (key && MOCK_QUESTIONS_POOL[key] && MOCK_QUESTIONS_POOL[key][difficulty]) {
                foundQuestions = [...MOCK_QUESTIONS_POOL[key][difficulty]];
            }

            // Fallback or fill remaining questions count
            const fallbackPool = DEFAULT_POOL;
            while (foundQuestions.length < count) {
                const randomQ = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
                // Avoid duplicating exactly
                if (!foundQuestions.some(q => q.question === randomQ.question)) {
                    foundQuestions.push(randomQ);
                } else {
                    // Create dynamic copy if needed
                    foundQuestions.push({
                        ...randomQ,
                        question: `${randomQ.question} (Variation regarding ${topic})`
                    });
                }
            }

            // Slice to exact count
            foundQuestions = foundQuestions.slice(0, count);

            // Adapt questions to selected topic and points
            const pointsMap = { EASY: 1, MEDIUM: 2, HARD: 3 };
            const adapted = foundQuestions.map(q => ({
                ...q,
                points: pointsMap[difficulty],
                selected: true, // Default selected
            }));

            setGeneratedQuestions(adapted);
            setGenerating(false);
            toast.success("AI generated successfully! Review the questions below.");
        }, 7000);
    };

    const handleToggleSelect = (index: number) => {
        setGeneratedQuestions(prev => prev.map((q, i) => i === index ? { ...q, selected: !q.selected } : q));
    };

    const handleAdd = async () => {
        const selected = generatedQuestions.filter(q => q.selected);
        if (selected.length === 0) {
            toast.error("Please select at least one question to add.");
            return;
        }

        // Strip the extra 'selected' parameter before submitting
        const formatted = selected.map((q) => {
            const newQ = { ...q };
            delete (newQ as Partial<typeof q>).selected;
            return newQ as QuestionRequestDTO;
        });
        
        try {
            await onAddQuestions(formatted);
            onOpenChange(false);
            // Reset state
            setGeneratedQuestions([]);
            setTopic("");
        } catch {
            toast.error("Failed to add questions");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!generating) onOpenChange(val);
        }}>
            <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-6 overflow-hidden">
                <DialogHeader className="border-b pb-4 shrink-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                            <Sparkles className="size-4.5 text-amber-500 animate-pulse" />
                        </div>
                        AI Quiz Question Generator
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                        Use our fine-tuned AI model to draft highly accurate, student-friendly multiple-choice questions instantly.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {!generating && generatedQuestions.length === 0 ? (
                        /* Step 1: Configuration Form */
                        <div className="flex flex-col gap-6 max-w-2xl mx-auto py-4">
                            {/* Preset Topics */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-foreground">Select Preset Topic</span>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_TOPICS.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTopic(t)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                                                topic === t
                                                    ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400"
                                                    : "border-border/60 hover:bg-muted hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Topic Input */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-foreground">Or Enter Custom Topic / Syllabus Segment</span>
                                <Input
                                    placeholder="e.g. Balanced BST Rotations, Graph DFS recursion, Heap sort..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="h-11 text-sm"
                                />
                            </div>

                            {/* Configuration Options grid */}
                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Difficulty selection */}
                                <div className="flex flex-col gap-2.5">
                                    <span className="text-sm font-semibold text-foreground">Difficulty Level</span>
                                    <div className="flex bg-muted/40 p-1 rounded-lg border gap-1">
                                        {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setDifficulty(d)}
                                                className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${
                                                    difficulty === d
                                                        ? "bg-background text-foreground shadow-sm border border-border/40"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                                                }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Count selection */}
                                <div className="flex flex-col gap-2.5">
                                    <span className="text-sm font-semibold text-foreground">Number of Questions</span>
                                    <div className="flex bg-muted/40 p-1 rounded-lg border gap-1">
                                        {[1, 2, 3, 5].map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setCount(c)}
                                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                                                    count === c
                                                        ? "bg-background text-foreground shadow-sm border border-border/40"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                                                }`}
                                            >
                                                {c} Qs
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : generating ? (
                        /* Step 2: Processing AI animation */
                        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                            <div className="relative flex items-center justify-center size-20 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                                <Loader2 className="size-10 text-amber-500 animate-spin" />
                                <Sparkles className="absolute size-4 text-orange-400 -top-1 -right-1 animate-bounce" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Engaging Algorithmic AI Model...</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Writing high-fidelity multiple-choice questions for <strong>{topic}</strong> ({difficulty}).
                            </p>

                            {/* Simulated stage ticker */}
                            <div className="w-full bg-muted/60 p-4 rounded-xl border border-dashed text-left font-mono text-xs flex items-start gap-3 min-h-[70px]">
                                <RefreshCw className="size-4.5 text-amber-500 animate-spin shrink-0 mt-0.5" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-foreground font-semibold">Current State:</span>
                                    <span className="text-muted-foreground animate-pulse">{loadingStages[loadingStage]}</span>
                                </div>
                            </div>
                            <div className="w-full mt-4 bg-muted h-1 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${((loadingStage + 1) / loadingStages.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        /* Step 3: Question Reviews & Selection List */
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between bg-muted/20 border p-3 rounded-lg text-sm mb-2">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="size-4.5 text-amber-500 shrink-0" />
                                    <span>AI has drafted <strong>{generatedQuestions.length}</strong> questions on <strong>{topic}</strong>.</span>
                                </div>
                                <span className="font-semibold text-xs text-muted-foreground">Select ones to import</span>
                            </div>

                            <div className="space-y-4">
                                {generatedQuestions.map((q, idx) => (
                                    <Card 
                                        key={idx} 
                                        className={`transition-all duration-200 border-l-4 ${
                                            q.selected 
                                                ? "border-l-emerald-500 bg-emerald-500/[0.01] border-emerald-500/20" 
                                                : "border-l-muted-foreground/30 border-border/80 hover:bg-muted/5"
                                        }`}
                                    >
                                        <CardContent className="p-4 flex gap-3.5 items-start">
                                            {/* Checkbox button */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggleSelect(idx)}
                                                className={`shrink-0 size-6 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                                                    q.selected
                                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                                        : "border-muted-foreground/30 bg-background"
                                                }`}
                                            >
                                                {q.selected && <Check className="size-4 stroke-[3]" />}
                                            </button>

                                            <div className="flex-1 flex flex-col gap-3 min-w-0">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-xs text-muted-foreground font-mono">Q{idx + 1}</span>
                                                        <Badge variant="outline" className="text-[10px] font-bold uppercase py-0 px-2 tracking-wide">
                                                            {q.type.replace(/_/g, " ")}
                                                        </Badge>
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs font-semibold">
                                                        {q.points} pt{q.points !== 1 ? "s" : ""}
                                                    </Badge>
                                                </div>

                                                <p className="text-sm font-semibold text-foreground">{q.question}</p>

                                                {/* Choices grid */}
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {q.choices.map((c, cIdx) => (
                                                        <div 
                                                            key={cIdx} 
                                                            className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs ${
                                                                c.isCorrect 
                                                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium" 
                                                                    : "bg-muted/30 border-transparent text-muted-foreground"
                                                            }`}
                                                        >
                                                            <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                                                c.isCorrect ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30"
                                                            }`}>
                                                                {c.isCorrect && <Check className="size-2.5 text-white" />}
                                                            </div>
                                                            <span className="line-clamp-2">{c.text}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Explanation Box */}
                                                {q.explanation && (
                                                    <div className="bg-muted/40 p-2.5 rounded-lg border border-dashed text-xs text-muted-foreground">
                                                        <span className="font-semibold text-foreground">Explanation:</span> {q.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4 shrink-0 flex items-center justify-between gap-3">
                    {!generating && generatedQuestions.length === 0 ? (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="text-sm h-10 px-4"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleGenerate}
                                className="text-sm h-10 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold gap-1.5 shadow-sm"
                            >
                                <Sparkles className="size-4" />
                                Generate Drafts
                            </Button>
                        </>
                    ) : generatedQuestions.length > 0 ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setGeneratedQuestions([])}
                                disabled={isPending}
                                className="text-sm h-10 px-4 gap-1.5"
                            >
                                <RefreshCw className="size-3.5" />
                                Start Over
                            </Button>
                            <Button
                                type="button"
                                onClick={handleAdd}
                                disabled={isPending || generatedQuestions.filter(q => q.selected).length === 0}
                                className="text-sm h-10 px-5 bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-1.5 shadow-sm"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Adding to Quiz...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="size-4" />
                                        Add Selected ({generatedQuestions.filter(q => q.selected).length})
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <div className="w-full text-center text-xs text-muted-foreground animate-pulse py-1">
                            Please do not close this modal while the AI completes its process...
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
