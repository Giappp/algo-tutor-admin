export const STARTER_CODE_LANGUAGES = ["java", "python", "cpp"] as const;

export type StarterCodeLanguage = (typeof STARTER_CODE_LANGUAGES)[number];

export const DEFAULT_STARTER_CODE: Record<StarterCodeLanguage, string> = {
    java: `import java.io.*;
import java.util.*;

public class Main {
    private static final FastScanner in = new FastScanner(System.in);
    private static final PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));

    public static void main(String[] args) {
        solve();
        out.flush();
    }

    private static void solve() {
        // Read from stdin with in.next(), in.nextInt(), in.nextLong(), ...
        // Write the answer to stdout with out.println(...).
    }

    private static class FastScanner {
        private final InputStream input;
        private final byte[] buffer = new byte[1 << 16];
        private int pointer;
        private int length;

        FastScanner(InputStream input) {
            this.input = input;
        }

        private int read() {
            if (pointer >= length) {
                try {
                    length = input.read(buffer);
                    pointer = 0;
                } catch (IOException exception) {
                    throw new UncheckedIOException(exception);
                }
                if (length <= 0) return -1;
            }
            return buffer[pointer++];
        }

        String next() {
            StringBuilder token = new StringBuilder();
            int character;
            do {
                character = read();
            } while (character <= ' ' && character != -1);

            while (character > ' ') {
                token.append((char) character);
                character = read();
            }
            return token.toString();
        }

        int nextInt() {
            return Integer.parseInt(next());
        }

        long nextLong() {
            return Long.parseLong(next());
        }
    }
}`,
    python: `import sys
from collections import Counter, defaultdict, deque
from heapq import heappop, heappush
from math import gcd, inf


def solve() -> None:
    data = sys.stdin.buffer.read().split()
    # Parse input from data, then write the answer with print(...) or sys.stdout.write(...).


def main() -> None:
    solve()


if __name__ == "__main__":
    main()
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

void solve() {
    // Read from stdin with cin and write the answer to stdout with cout.
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
`,
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
        fileName: "Main.java",
        runtime: "JDK 21",
        description: "Fast stdin | buffered stdout",
        accentClass: "text-orange-600 dark:text-orange-400",
        badgeBg: "bg-orange-500/10",
    },
    python: {
        label: "Python",
        shortLabel: "PY",
        monacoLanguage: "python",
        fileName: "main.py",
        runtime: "Python 3.12",
        description: "Buffered stdin | main entry point",
        accentClass: "text-blue-600 dark:text-blue-400",
        badgeBg: "bg-blue-500/10",
    },
    cpp: {
        label: "C++",
        shortLabel: "C++",
        monacoLanguage: "cpp",
        fileName: "main.cpp",
        runtime: "GNU C++20",
        description: "STL-ready | fast standard I/O",
        accentClass: "text-sky-600 dark:text-sky-400",
        badgeBg: "bg-sky-500/10",
    },
};
