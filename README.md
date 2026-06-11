# Project Objectives

AlgoTutor is a smart online learning platform that combines algorithmic theory with hands-on coding through specialized
learning roadmaps. It guides learners systematically from foundational concepts to advanced problem-solving.

# Features

## Specialized Roadmaps & Knowledge Isolation

- Lessons are clearly divided into core topics based on Data Structure and Algorithm (Arrays, Strings, Linked Lists,
  Trees, Graphs, Dynamic Programming,
  etc.).

- Coding exercises are strictly isolated to the current topic, preventing confusion from advanced concepts the user
  hasn't learned yet.

## Multi-Layered Lesson Structure

- Theory: Foundational concepts with visuals and pseudocode.
- Quizzes: Quick assessments to reinforce the theory.
- Coding: Auto-graded practice problems focused entirely on the active topic.

## Progressive Difficulty

- Problems scale from Easy (basic implementation) to Medium (logic application) and Hard (performance optimization).
- Learners must complete basic milestones to unlock advanced content.

## Context-Aware AI Assistant

- Powered by LLMs and vector databases to analyze the user's code and intent.
- Provides helpful hints strictly within the scope of the current lesson. This helps students debug and solve problems
  on their own without being overwhelmed by overly complex, out-of-scope solutions.

## Environment Setup

The admin app uses a same-origin API proxy. Browser requests go to `/api/*`, and Next.js rewrites them to the backend
origin configured by the server-only `API_SERVER_URL` variable.

For local development:

```bash
cp .env.example .env.local
npm run dev
```

`.env.local` is intentionally ignored by Git. Next.js does not load files named `.env-local`.

## Deployment

Set `API_SERVER_URL` in the deployment environment before running the production build:

```bash
API_SERVER_URL=https://api.example.com npm run build
npm run start
```

`API_SERVER_URL` must contain only the backend origin, for example `https://api.example.com`. Do not append `/api`.
Because rewrites are generated during `next build`, the variable must be available at build time. No
`NEXT_PUBLIC_SERVER_URL` variable is needed.

The backend should issue the `access-token` cookie without a backend-only `Domain` attribute so the cookie can be stored
for the admin app origin. In production, use `Secure`, `HttpOnly`, and an appropriate `SameSite` policy.
