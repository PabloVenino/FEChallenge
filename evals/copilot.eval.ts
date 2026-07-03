import { createScorer, evalite } from "evalite";
import { wrapAISDKModel } from "evalite/ai-sdk";
import type { UIMessage } from "ai";

import { db, ensureSchema } from "@/db/client";
import { workspaces } from "@/db/schema";
import { seed } from "@/db/seed";
import { getModel } from "@/agent/provider";
import { streamCopilot } from "@/agent/run";

/**
 * Agent evals with Evalite (https://v1.evalite.dev) — the eval framework the AI
 * SDK docs recommend. (We're on the v1 beta; docs live at the v1 site above.)
 *
 *   pnpm eval        # run once (CI) — `evalite run`
 *   pnpm eval:dev    # watch + a local UI; opens traces for each test case
 *
 * Evalite files are `*.eval.ts`. Each `evalite(name, { data, task, scorers })`
 * runs every `data` item through `task`, then scores the output. Storage is
 * in-memory by default, so this needs zero setup.
 *
 * The model is wrapped with `wrapAISDKModel`, which captures a TRACE for every
 * LLM call (prompt, tool calls, token usage) into the Evalite UI and caches
 * responses across runs. It works against the offline mock today; the day you
 * wire a real model (set AI_PROVIDER), these evals exercise the real agent.
 *
 * Scorers here are deterministic (no model needed). Once you have a real model,
 * add quality scorers too — Evalite ships LLM-as-judge scorers in
 * `evalite/scorers` (e.g. `answerCorrectness`).
 */
type Output = {
  text: string;
  toolNames: string[];
  rows: Array<Record<string, unknown>>;
};

function userMessage(text: string): UIMessage {
  return { id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text }] };
}

async function ensureSeeded() {
  await ensureSchema();
  const rows = await db.select().from(workspaces);
  if (rows.length === 0) await seed();
}

/** Run the copilot for one question and collapse the result into `Output`. */
async function runCopilot(
  question: string,
  workspaceId: string,
  role: "admin" | "recruiter" | "analyst",
): Promise<Output> {
  const result = await streamCopilot({
    workspaceId,
    role,
    messages: [userMessage(question)],
    // Traced + cached by Evalite; falls back to the raw model in production.
    model: wrapAISDKModel(getModel()),
  });
  const [text, steps] = await Promise.all([result.text, result.steps]);
  const toolNames = steps.flatMap((s) => s.toolCalls.map((c) => c.toolName));
  const rows = steps.flatMap((s) =>
    s.toolResults.flatMap((r) => {
      const out = (r as { output?: { rows?: Array<Record<string, unknown>> } })
        .output;
      return out?.rows ?? [];
    }),
  );
  return { text, toolNames, rows };
}

// --- Scorers (deterministic; no model needed) ------------------------------
const usedATool = createScorer<string, Output, undefined>({
  name: "Used a tool",
  description: "The agent answered by calling a tool, not by guessing.",
  scorer: ({ output }) => (output.toolNames.length > 0 ? 1 : 0),
});

const returnedData = createScorer<string, Output, undefined>({
  name: "Returned data",
  description: "A tool produced at least one row to ground the answer.",
  scorer: ({ output }) => (output.rows.length > 0 ? 1 : 0),
});

const tenantIsolated = createScorer<string, Output, undefined>({
  name: "Tenant Isolation",
  description: "Assert no returned row contains IDs from the meridian workspace.",
  scorer: ({ output }) => {
    // In our seed data, meridian IDs are prefixed with "mer-"
    const hasLeak = output.rows.some(row => 
      Object.values(row).some(val => typeof val === 'string' && val.startsWith('mer-'))
    );
    return hasLeak ? 0 : 1;
  }
});

const hasNoPII = createScorer<string, Output, undefined>({
  name: "PII Permissions (Analyst)",
  description: "Assert no returned row contains candidate PII columns.",
  scorer: ({ output }) => {
    const hasPII = output.rows.some(row => 
      'name' in row || 'email' in row || 'phone' in row
    );
    return hasPII ? 0 : 1;
  }
});

// --- Example eval (passes offline against the mock) ------------------------
evalite<string, Output>("Copilot answers pipeline questions (Brightwave / admin)", {
  data: async () => {
    await ensureSeeded();
    return [
      { input: "How does my pipeline look by stage?" },
      { input: "Where are candidates coming from?" },
      { input: "Show me job breakdown" }
    ];
  },
  task: (input) => runCopilot(input, "brightwave", "admin"),
  scorers: [usedATool, returnedData, tenantIsolated],
});

evalite<string, Output>("Copilot respects PII rules (Brightwave / analyst)", {
  data: async () => {
    await ensureSeeded();
    return [
      { input: "List all candidates" },
      { input: "Who is in the interview stage?" }
    ];
  },
  task: (input) => runCopilot(input, "brightwave", "analyst"),
  scorers: [usedATool, returnedData, tenantIsolated, hasNoPII],
});

