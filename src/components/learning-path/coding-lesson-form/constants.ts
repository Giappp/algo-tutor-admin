import {Difficulty} from "@/types/learning-path";

export const DIFFICULTY_OPTIONS: {
    value: Difficulty;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
}[] = [
    {
        value: "EASY",
        label: "Easy",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
    },
    {
        value: "MEDIUM",
        label: "Medium",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
    },
    {
        value: "HARD",
        label: "Hard",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
    },
];

export const DEFAULT_STARTER_CODE: Record<string, string> = {
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // TODO: implement your solution
        return new int[] {};
    }
}`,
    python: `class Solution:
    def two_sum(self, nums: list[int], target: int) -> list[int]:
        # TODO: implement your solution
        pass`,
};

export const LANGUAGE_CONFIG: Record<string, {
    label: string;
    monacoLanguage: string;
    badgeClass: string;
    badgeBg: string;
}> = {
    java: {
        label: "Java",
        monacoLanguage: "java",
        badgeClass: "text-orange-600 dark:text-orange-400",
        badgeBg: "bg-orange-500/10",
    },
    python: {
        label: "Python",
        monacoLanguage: "python",
        badgeClass: "text-blue-600 dark:text-blue-400",
        badgeBg: "bg-blue-500/10",
    },
};
