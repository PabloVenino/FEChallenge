# Decisions

## Overview

I've improved the ATS Analytics Copilot that successfully meets the core requirements of tenant isolation and PII permissions enforcement. The agent can answer questions about the workspace data using a set of purpose-built tools, and displays the results using a rich Generative UI powered by Recharts. The codebase includes end-to-end integration from the DB layer to the Chat UI, backed by deterministic Evalite benchmarks.

## Architecture & key decisions

- **Tool catalog** — I implemented four primary tools: `applicationCountByStage`, `candidatesBySource`, `jobBreakdown`, and `listCandidates` (along with `getCandidateDetail`). I chose to keep the tools granular (e.g., separating "list" from "detail") so the model doesn't get overwhelmed and can compose them step-by-step.
- **Query layer** — The queries are composable Drizzle select statements located in `analytics.ts`. Each query strictly accepts `ctx` as its first parameter to enforce scoping from the top down.
- **Tenant scoping** — To make tenant scoping impossible to forget, I enforced a pattern where every query must call `scopeWhere(table, ctx)` in its `.where()` clause. It explicitly requires `ctx` which carries the `workspaceId`.
- **Permissions** — I implemented approach of column projection at query time. `canReadColumn` determines access based on role, and `selectCandidateColumns(role)` generates a safe Drizzle column map. If the role is `analyst`, the PII columns simply aren't selected from the database. This makes PII leaks unrepresentable at the query level.
- **Generative UI** — Tool results flow to the UI as `{ rows, display }`. I used Recharts to render rich client-side `BarChart` and `LineChart` components based on the `display.kind` hint, falling back to a clean `DataTable`. The tool calls are wrapped in a transition state (Calling ⚙️ -> Result ✓) for a better UX.

## Model & agent

I chose Gemini Flash 2.5 primarily because of its generous free tier, which makes it ideal for prototyping and experimenting. Additionally, its AI Studio interface is straightforward to use, and I've worked with it before, so I was able to get it up and running quickly. 
The agent loop is configured to allow up to 8 steps (`stepCountIs(8)`) to support multi-step reasoning (e.g. searching jobs -> finding candidate). Tool errors are caught inside the tool execution block and fed back to the LLM gracefully so it can recover instead of crashing the stream.

## Benchmarks

- **Tenant Isolation**: The `tenantIsolated` scorer iterates over every value in every returned row and asserts that no string value starts with `"mer-"` (the prefix used for Meridian IDs in the seed data). Because the query functions are tested under the `brightwave` context, this guarantees no cross-tenant leakage.
- **PII Permissions**: The `hasNoPII` scorer asserts that when queried as an `analyst`, the returned rows never contain the keys `name`, `email`, or `phone`. This verifies that `selectCandidateColumns` is correctly omitting those fields.

## Trade-offs & cuts

- **Server-streamed UI vs Client rendering**: I chose to render charts client-side based on a JSON hint rather than using RSC (React Server Components) for `streamUI`. It was faster to integrate with the existing Next.js `useChat` setup and kept the architecture simpler.
- **Complex Analytical Queries**: I left out more complex queries in favor of ensuring the core permissions and tool composition loop were rock solid. With another day, I would try to work on having more data, improving the way we can analyze it and building a robust time-series charting, a `finalAnswer` structured output tool to wrap up the conversation, and a plus being a history feed of chats, attached to each company / role (each role would have its own history).

## Working with the agent

Using AI tools is encouraged. Briefly:

- I have delegated:
  1. Brainstorming and data analysis: what features would be good for someone that would actually use the product.
  2. Coding assistent: I have used Antigravity for several tasks including:
    * Understanding codebase and file structure
    * Implementing new features based on my requirements
    * Debugging and fixing issues
    * Implementing data fetching logic.
    * Optimizing code and following best practices.
  3. Documenting and generate content texts - commit messages, DECISIONS.md file (this one lol), and Pull Request description.
  
- Where the agent was wrong and you caught it:
  The agent initially suggested stripping PII post-query in memory. I overrode this and directed it to implement projection at the database level (`selectCandidateColumns`), which is safer and prevents accidental memory leaks.
  The agent didnt thought of creating smaller components, that was my call
  The agent didnt initially created memoized components as well.

- What you'd never let it decide on its own:
  The fundamental security architecture (tenant isolation mechanism and role enforcement strategy). Those need to be explicitly designed and verified by a human.

## Hours

Roughly 6 hours.
You can check it out my working hours in this link: [WakaTime](https://wakatime.com/@pablo_venino/projects/fvvethyohe?start=2026-06-27&end=2026-07-03)