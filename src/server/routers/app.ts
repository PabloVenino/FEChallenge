import { z } from "zod";

import { db, ensureSchema } from "@/db/client";
import {
  applicationCountByStage,
  applicationsOverTime,
  candidatesBySource,
  jobBreakdown,
  candidateList,
  candidateDetail
} from "@/db/analytics";
import { workspaces } from "@/db/schema";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  workspaces: router({
    // For the tenant switcher in the UI.
    list: publicProcedure.query(async () => {
      await ensureSchema();
      return db.select().from(workspaces).orderBy(workspaces.name);
    }),
  }),

  analytics: router({
    // Reference scoped read: passes ctx (workspaceId + role) to the analytics
    // layer. Mirror this pattern for any procedures you add.
    applicationsByStage: publicProcedure
      .input(z.object({ jobId: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        await ensureSchema();
        return applicationCountByStage(ctx, input ?? {});
      }),

    applicationsOverTime: publicProcedure
      .query(async ({ ctx }) => {
        await ensureSchema();
        return applicationsOverTime(ctx);
      }),

    candidatesBySource: publicProcedure
      .query(async ({ ctx }) => {
        await ensureSchema();
        return candidatesBySource(ctx);
      }),

    jobBreakdown: publicProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        await ensureSchema();
        return jobBreakdown(ctx, input ?? {});
      }),

    candidateList: publicProcedure
      .input(z.object({ jobId: z.string().optional(), stage: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        await ensureSchema();
        return candidateList(ctx, input ?? {});
      }),

    candidateDetail: publicProcedure
      .input(z.object({ candidateId: z.string() }))
      .query(async ({ ctx, input }) => {
        await ensureSchema();
        return candidateDetail(ctx, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
