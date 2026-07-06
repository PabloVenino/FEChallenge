import type { UIMessage } from "ai";

import { streamCopilot } from "@/agent/run";
import { tenantFromHeaders } from "@/server/context";
import { buildErrorResponse, getStreamErrorMessage } from "@/server/errors";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { workspaceId, role } = tenantFromHeaders(req);
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = await streamCopilot({ workspaceId, role, messages });

    // `getErrorMessage` converts any error thrown *during* the stream into an
    // error part the client receives instead of a silent connection reset.
    return result.toUIMessageStreamResponse({
      getErrorMessage: getStreamErrorMessage,
    });
  } catch (err) {
    // Errors thrown *before* the stream starts (bad body, model init failures,
    // missing API key, etc.) are returned as structured JSON.
    return buildErrorResponse(err);
  }
}
