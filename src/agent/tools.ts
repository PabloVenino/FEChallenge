import { tool } from "ai";
import { z } from "zod";

import { 
  applicationCountByStage,
  candidatesBySource,
  jobBreakdown,
  candidateList,
  candidateDetail,
  type AnalyticsCtx 
} from "@/db/analytics";
import type { Display, ToolResult } from "./artifact";

/**
 * The copilot's tool catalog — what the agent can actually do.
 *
 * This ships with ONE worked example. Designing the rest of the catalog is the
 * heart of the exercise: which tools should exist, their granularity, how their
 * inputs are shaped for a model to fill, and what each returns for the UI.
 *
 * The agent picks tools and passes high-level params — it never writes SQL.
 * Pass `ctx` to every query so results stay scoped to this workspace, and gate
 * PII by `ctx.role` (see src/db/permissions.ts). Each tool returns
 * `{ rows, display }` — see src/agent/artifact.ts.
 */
export function buildTools(ctx: AnalyticsCtx) {
  const result = (rows: ToolResult["rows"], display: Display, silent?: boolean): ToolResult => ({
    rows,
    display: silent ? { kind: "hidden" } : display,
  });

  return {
    // REFERENCE TOOL — a scoped query + typed input + a display hint the UI
    // renders. Use it as the template for the tools you add.
    applicationCountByStage: tool({
      description:
        "Count applications grouped by pipeline stage (applied, screen, interview, offer, hired, rejected). Pass a jobId to scope to one job.",
      inputSchema: z.object({ 
        jobId: z.string().optional(),
        silent: z.boolean().optional().describe("Set to true to hide this tool call from the UI (useful for intermediate lookups)")
      }),
      async execute({ jobId, silent }) {
        try {
          const rows = await applicationCountByStage(ctx, { jobId });
          return result(rows, {
            kind: "bar",
            x: "stage",
            y: "count",
            title: "Applications by stage",
          }, silent);
        } catch (e: any) {
          return { rows: [], display: { kind: "table", columns: [] } as Display, error: e.message } as unknown as ToolResult;
        }
      },
    }),

    candidatesBySource: tool({
      description: "Count candidates by referral source.",
      inputSchema: z.object({
        silent: z.boolean().optional().describe("Set to true to hide this tool call from the UI (useful for intermediate lookups)")
      }),
      async execute({ silent }) {
        try {
          const rows = await candidatesBySource(ctx);
          return result(rows, {
            kind: "bar",
            x: "source",
            y: "count",
            title: "Candidates by source",
          }, silent);
        } catch (e: any) {
          return { rows: [], display: { kind: "table", columns: [] } as Display, error: e.message } as unknown as ToolResult;
        }
      },
    }),

    jobBreakdown: tool({
      description: "List jobs with their title, department, location, and status. Pass a status (open, closed, draft) to filter.",
      inputSchema: z.object({ 
        status: z.enum(["open", "closed", "draft"]).optional(),
        silent: z.boolean().optional().describe("Set to true to hide this tool call from the UI (useful for intermediate lookups)")
      }),
      async execute({ status, silent }) {
        try {
          const rows = await jobBreakdown(ctx, { status });
          return result(rows, {
            kind: "table",
            columns: ["title", "department", "location", "status"],
          }, silent);
        } catch (e: any) {
          return { rows: [], display: { kind: "table", columns: [] } as Display, error: e.message } as unknown as ToolResult;
        }
      },
    }),

    listCandidates: tool({
      description: "List candidates. Pass jobId or stage to filter candidates. Returns basic candidate info (with PII if role allows).",
      inputSchema: z.object({
        jobId: z.string().optional(),
        stage: z.enum(["applied", "screen", "interview", "offer", "hired", "rejected"]).optional(),
        silent: z.boolean().optional().describe("Set to true to hide this tool call from the UI (useful for intermediate lookups)")
      }),
      async execute({ jobId, stage, silent }) {
        try {
          const rows = await candidateList(ctx, { jobId, stage });
          return result(rows, {
            kind: "table",
            columns: rows.length > 0 ? Object.keys(rows[0]) : [],
          }, silent);
        } catch (e: any) {
          return { rows: [], display: { kind: "table", columns: [] } as Display, error: e.message } as unknown as ToolResult;
        }
      },
    }),

    getCandidateDetail: tool({
      description: "Get full profile detail of a single candidate by candidateId.",
      inputSchema: z.object({ 
        candidateId: z.string(),
        silent: z.boolean().optional().describe("Set to true to hide this tool call from the UI (useful for intermediate lookups)")
      }),
      async execute({ candidateId, silent }) {
        try {
          const rows = await candidateDetail(ctx, { candidateId });
          return result(rows, {
            kind: "table",
            columns: rows.length > 0 ? Object.keys(rows[0]) : [],
          }, silent);
        } catch (e: any) {
          return { rows: [], display: { kind: "table", columns: [] } as Display, error: e.message } as unknown as ToolResult;
        }
      }
    }),
  };
}

export type CopilotTools = ReturnType<typeof buildTools>;
