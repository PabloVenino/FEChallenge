import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import type { Context } from "./context";
import { classifyError } from "./errors";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const { userMessage } = classifyError(error.cause ?? error);
    return {
      ...shape,
      data: {
        ...shape.data,
        userMessage,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
