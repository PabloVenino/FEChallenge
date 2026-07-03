import { and, count, desc, eq, sql, type AnyColumn, type SQL } from "drizzle-orm";

import { db } from "./client";
import { canReadColumn, type Role } from "./permissions";
import { applications, candidates, jobs } from "./schema";

/**
 * Scoped analytics data layer for the copilot.
 *
 * This ships with ONE worked example — `applicationCountByStage` — as a
 * reference pattern. Designing the rest of the query layer the copilot needs is
 * part of the exercise (e.g. applications over time, candidates by source,
 * time-to-hire, per-job breakdowns, individual candidates, …).
 *
 * Two hard requirements for everything you add here:
 *  1. TENANT SCOPING — every query is constrained to `ctx.workspaceId`. A query
 *     must never read another workspace's rows. (Route scoping through one
 *     place — see `scopeWhere` — so it can't be forgotten as you add queries.)
 *  2. PERMISSIONS — candidate PII (name / email / phone) must be gated by role;
 *     an `analyst` may not read it (see `src/db/permissions.ts`).
 *
 * The benchmark in `evals/run.ts` verifies both against whatever tools you build.
 */

export type AnalyticsCtx = { workspaceId: string; role: Role };

/** The one place tenant scoping lives: AND-s the workspace filter into a query. */
function scopeWhere(
  table: { workspaceId: AnyColumn },
  ctx: AnalyticsCtx,
  extra: Array<SQL | undefined> = [],
): SQL {
  const parts = [eq(table.workspaceId, ctx.workspaceId), ...extra].filter(
    (p): p is SQL => p !== undefined,
  );
  // Always has at least the workspace filter, so it's never undefined.
  return and(...parts)!;
}

/** 
 * Returns a Drizzle column map for candidates, omitting PII if the role cannot see it.
 * Makes a PII leak unrepresentable for queries using this helper.
 */
export function selectCandidateColumns(role: Role) {
  const canSeePii = canReadColumn(role, "candidates", "name");
  return {
    id: candidates.id,
    workspaceId: candidates.workspaceId,
    source: candidates.source,
    createdAt: candidates.createdAt,
    ...(canSeePii ? {
      name: candidates.name,
      email: candidates.email,
      phone: candidates.phone,
    } : {}),
  };
}

/**
 * REFERENCE QUERY: applications grouped by pipeline stage, scoped to the
 * caller's workspace. Use it as the template for the rest of the layer.
 *
 * `ctx` comes first on purpose: a query can't even be expressed without the
 * tenant scope, so it can't be forgotten.
 */
export async function applicationCountByStage(
  ctx: AnalyticsCtx,
  opts: { jobId?: string } = {},
) {
  const extra = opts.jobId ? [eq(applications.jobId, opts.jobId)] : [];
  return db
    .select({ stage: applications.stage, count: count() })
    .from(applications)
    .where(scopeWhere(applications, ctx, extra))
    .groupBy(applications.stage)
    .orderBy(desc(count()));
}

export async function applicationsOverTime(ctx: AnalyticsCtx) {
  return db
    .select({
      date: sql<string>`to_char(${applications.appliedAt}, 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(applications)
    .where(scopeWhere(applications, ctx))
    .groupBy(sql`to_char(${applications.appliedAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${applications.appliedAt}, 'YYYY-MM-DD')`);
}

export async function candidatesBySource(ctx: AnalyticsCtx) {
  return db
    .select({ source: candidates.source, count: count() })
    .from(candidates)
    .where(scopeWhere(candidates, ctx))
    .groupBy(candidates.source)
    .orderBy(desc(count()));
}

export async function jobBreakdown(
  ctx: AnalyticsCtx,
  opts: { status?: string } = {}
) {
  const extra = opts.status ? [eq(jobs.status, opts.status)] : [];
  return db
    .select({
      id: jobs.id,
      title: jobs.title,
      department: jobs.department,
      location: jobs.location,
      status: jobs.status,
    })
    .from(jobs)
    .where(scopeWhere(jobs, ctx, extra))
    .orderBy(jobs.title);
}

export async function candidateList(
  ctx: AnalyticsCtx,
  opts: { jobId?: string; stage?: string } = {}
) {
  const extra: Array<SQL | undefined> = [];
  if (opts.jobId) extra.push(eq(applications.jobId, opts.jobId));
  if (opts.stage) extra.push(eq(applications.stage, opts.stage));

  if (extra.length > 0) {
    return db
      .select({
        ...selectCandidateColumns(ctx.role),
        stage: applications.stage,
        jobId: applications.jobId,
      })
      .from(candidates)
      .innerJoin(applications, eq(candidates.id, applications.candidateId))
      .where(scopeWhere(candidates, ctx, extra));
  }

  return db
    .select(selectCandidateColumns(ctx.role))
    .from(candidates)
    .where(scopeWhere(candidates, ctx));
}

export async function candidateDetail(ctx: AnalyticsCtx, opts: { candidateId: string }) {
  const extra = [eq(candidates.id, opts.candidateId)];
  const results = await db
    .select(selectCandidateColumns(ctx.role))
    .from(candidates)
    .where(scopeWhere(candidates, ctx, extra))
    .limit(1);
    
  return results;
}

