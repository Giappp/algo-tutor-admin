export const STARTER_CODE_LANGUAGES = ["java", "python", "cpp"] as const;

export type StarterCodeLanguage = (typeof STARTER_CODE_LANGUAGES)[number];

export const DEFAULT_STARTER_CODE: Record<StarterCodeLanguage, string> = {
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
    cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // TODO: implement your solution
        return {};
    }
};`,
};

export const LANGUAGE_CONFIG: Record<StarterCodeLanguage, {
    label: string;
    shortLabel: string;
    monacoLanguage: string;
    fileName: string;
    runtime: string;
    description: string;
    accentClass: string;
    badgeBg: string;
}> = {
    java: {
        label: "Java",
        shortLabel: "JAVA",
        monacoLanguage: "java",
        fileName: "Solution.java",
        runtime: "JDK 21",
        description: "Class-based starter",
        accentClass: "text-orange-600 dark:text-orange-400",
        badgeBg: "bg-orange-500/10",
    },
    python: {
        label: "Python",
        shortLabel: "PY",
        monacoLanguage: "python",
        fileName: "solution.py",
        runtime: "Python 3.12",
        description: "Typed function starter",
        accentClass: "text-blue-600 dark:text-blue-400",
        badgeBg: "bg-blue-500/10",
    },
    cpp: {
        label: "C++",
        shortLabel: "C++",
        monacoLanguage: "cpp",
        fileName: "solution.cpp",
        runtime: "GNU C++20",
        description: "STL-ready class starter",
        accentClass: "text-sky-600 dark:text-sky-400",
        badgeBg: "bg-sky-500/10",
    },
};
