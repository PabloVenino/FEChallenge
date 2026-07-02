# BuildWithin - ATS Platform
---

## About this Project

This is a multi-tenant **ATS analytics copilot**. An AI agent chats with a hiring team about **one workspace's** recruiting data (jobs, candidates, applications), calls tools to answer questions, and renders the results as charts/tables.

---

## Common Commands

Run, seed, run evalite (test LLM response) - used a lot in development environment.

```cmd
  npm run dev   # runs the dev environment
  npm db:seed   # wipe + seed the two workspaces
  npm eval      # run agent evals (in-memory) - test its performance
```

---

## Project Structure

```
src/
  db/        Drizzle schema + PGlite client + seed + analytics.ts (query layer) + permissions.ts
  server/    tRPC router + context (carries workspaceId + role from headers)
  agent/     tools.ts · run.ts (streamText loop) · provider.ts · mock-model.ts · artifact.ts
  app/       chat UI, providers, /api/chat, /api/trpc
evals/       agent evals — Evalite *.eval.ts (pnpm eval)
```

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Vercel AI SDK v6 · tRPC v11 + TanStack Query + superjson · Drizzle ORM over PGlite (in-process Postgres, file-backed at `./.pglite`) · Tailwind v3 · TypeScript strict.

---

## Coding Style
GOOD:

```typescript
  // GOOD: aligned, variables that mean something, no trailing commas where not needed, concise throughout the codebase (fetchUser, fetchWorkspace, fetchData)
  const quantityOfEngineers: number = 1;
  export const fetchUser = async (id: string): Promise<User> => {
    // method implementation
  }


  // BAD: meaningful variable names are a must, verbose, weird spacing, unnecessary trailing commas, unsafe due typing
  export default function(id) { ... };
  const y  = 2  ,
```

---

## Workflow
1. Understand requirements - asking clarifying questions as needed
2. Create a feature/fix/chore branch
3. Implement the feature/fix/chore functionality
4. Open a PR with description (serving as documentation)

---

## Boundaries

### Always:
- Write clean code
- Write self-documented code
- Test-covered code
- Keep up-to-date with latest changes 

### Avoid:
- Unnecessary comments - code must be self-documenting
- Unnecessary files - if it's not needed, delete it
- Over-engineering - KISS principle
- Premature optimization

### Never:
- Never commit secrets (.env files, for example)
- Never modify the README.md, CLAUDE.md or AGENTS.MD folders - unless strictly asked for
- Never make assumptions, always ask clarifying questions

---

