/**
 * Problem statement templates for coding lessons.
 * Each template provides a structured starting point for common problem patterns.
 */

export interface ProblemTemplate {
    id: string;
    label: string;
    category: string;
    description: string;
    statement: string;
    constraints: string[];
    examples: { input: string; output: string; explanation: string }[];
    hints: string[];
}

export const PROBLEM_TEMPLATES: ProblemTemplate[] = [
    {
        id: "array-search",
        label: "Array Search",
        category: "Array",
        description: "Find element(s) in an array matching a condition",
        statement: `<h2>Problem</h2>
<p>Given an array of integers <code>nums</code> and a target value <code>target</code>, return the indices of the two numbers that add up to <code>target</code>.</p>
<h3>Notes</h3>
<ul>
<li>Each input has exactly one solution</li>
<li>You may not use the same element twice</li>
<li>You can return the answer in any order</li>
</ul>`,
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists",
        ],
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]",
            },
        ],
        hints: [
            "Try using a hash map to store values you've already seen",
            "For each element, check if target - element exists in the map",
        ],
    },
    {
        id: "string-manipulation",
        label: "String Manipulation",
        category: "String",
        description: "Transform or validate a string",
        statement: `<h2>Problem</h2>
<p>Given a string <code>s</code>, [describe the transformation or validation required].</p>
<p>Return [the expected result].</p>
<h3>Notes</h3>
<ul>
<li>[Note about character set, e.g. lowercase English letters only]</li>
<li>[Note about edge cases]</li>
</ul>`,
        constraints: [
            "1 <= s.length <= 10^5",
            "s consists of [character set description]",
        ],
        examples: [
            {
                input: 's = "example"',
                output: '"result"',
                explanation: "Explanation of how the output is derived",
            },
        ],
        hints: [
            "Consider using two pointers or sliding window",
            "Think about what data structure would help track characters efficiently",
        ],
    },
    {
        id: "linked-list",
        label: "Linked List",
        category: "Linked List",
        description: "Operate on a singly/doubly linked list",
        statement: `<h2>Problem</h2>
<p>Given the <code>head</code> of a singly linked list, [describe the operation to perform].</p>
<p>Return [the expected result, e.g. the modified list head].</p>
<h3>Definition</h3>
<pre><code>class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}</code></pre>`,
        constraints: [
            "The number of nodes in the list is in the range [0, 10^4]",
            "-10^5 <= Node.val <= 10^5",
        ],
        examples: [
            {
                input: "head = [1,2,3,4,5]",
                output: "[expected output]",
                explanation: "Explanation of the transformation",
            },
        ],
        hints: [
            "Consider using a dummy head node to simplify edge cases",
            "Two-pointer technique (slow/fast) is useful for many linked list problems",
        ],
    },
    {
        id: "tree-traversal",
        label: "Binary Tree",
        category: "Tree",
        description: "Traverse or transform a binary tree",
        statement: `<h2>Problem</h2>
<p>Given the <code>root</code> of a binary tree, [describe what to compute or transform].</p>
<p>Return [the expected result].</p>
<h3>Definition</h3>
<pre><code>class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int val) { this.val = val; }
}</code></pre>`,
        constraints: [
            "The number of nodes in the tree is in the range [0, 10^4]",
            "-100 <= Node.val <= 100",
        ],
        examples: [
            {
                input: "root = [3,9,20,null,null,15,7]",
                output: "[expected output]",
                explanation: "Explanation of the result",
            },
        ],
        hints: [
            "Think about whether DFS (preorder/inorder/postorder) or BFS would work better",
            "Recursive solutions often map naturally to tree problems",
        ],
    },
    {
        id: "dynamic-programming",
        label: "Dynamic Programming",
        category: "DP",
        description: "Optimize with memoization or tabulation",
        statement: `<h2>Problem</h2>
<p>[Describe the optimization problem — what are we maximizing/minimizing?]</p>
<p>Return [the optimal value or solution].</p>
<h3>Notes</h3>
<ul>
<li>[Describe the choices available at each step]</li>
<li>[Describe any constraints on choices]</li>
</ul>`,
        constraints: [
            "1 <= n <= 10^3",
            "[Additional constraints on input values]",
        ],
        examples: [
            {
                input: "[input description]",
                output: "[optimal value]",
                explanation: "Explanation of the optimal solution path",
            },
        ],
        hints: [
            "Define the state: what information do you need to make a decision?",
            "Write the recurrence relation before coding",
            "Consider whether top-down (memoization) or bottom-up (tabulation) is simpler",
        ],
    },
    {
        id: "graph-traversal",
        label: "Graph",
        category: "Graph",
        description: "BFS/DFS on a graph structure",
        statement: `<h2>Problem</h2>
<p>You are given a graph with <code>n</code> nodes (labeled from <code>0</code> to <code>n-1</code>) and a list of edges.</p>
<p>[Describe what to find — shortest path, connected components, cycle detection, etc.]</p>
<h3>Input Format</h3>
<ul>
<li><code>n</code> — number of nodes</li>
<li><code>edges</code> — list of [u, v] pairs representing edges</li>
</ul>`,
        constraints: [
            "1 <= n <= 10^4",
            "0 <= edges.length <= n * (n - 1) / 2",
            "edges[i].length == 2",
            "0 <= u, v < n",
            "u != v (no self-loops)",
        ],
        examples: [
            {
                input: "n = 4, edges = [[0,1],[1,2],[2,3]]",
                output: "[expected output]",
                explanation: "Explanation of the graph traversal result",
            },
        ],
        hints: [
            "Build an adjacency list from the edge list",
            "Consider whether BFS (shortest path) or DFS (exploration) fits better",
            "Track visited nodes to avoid infinite loops",
        ],
    },
    {
        id: "sorting-searching",
        label: "Binary Search",
        category: "Search",
        description: "Efficient search in sorted data",
        statement: `<h2>Problem</h2>
<p>Given a sorted array <code>nums</code>, [describe what to find using binary search].</p>
<p>Return [the expected result]. If not found, return <code>-1</code>.</p>
<h3>Requirements</h3>
<ul>
<li>Your solution must run in <code>O(log n)</code> time complexity</li>
</ul>`,
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4",
            "nums is sorted in ascending order",
            "All values in nums are unique",
        ],
        examples: [
            {
                input: "nums = [-1,0,3,5,9,12], target = 9",
                output: "4",
                explanation: "9 exists in nums and its index is 4",
            },
        ],
        hints: [
            "Standard binary search: compare middle element with target",
            "Be careful with the boundary conditions (left <= right vs left < right)",
        ],
    },
];
