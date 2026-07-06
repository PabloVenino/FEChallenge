/**
 * Unit tests for the /api/chat error-handling layer.
 *
 * These tests mock `streamCopilot` so we exercise the route's try/catch and
 * `classifyError` mapping WITHOUT hitting a real AI provider.
 */

import { describe, expect, it, vi, beforeAll } from "vitest";

// ---------------------------------------------------------------------------
// We test `classifyError` and `buildErrorResponse` directly — they are pure
// functions with no I/O, which keeps the tests fast and deterministic.
// ---------------------------------------------------------------------------

import {
  classifyError,
  buildErrorResponse,
  getStreamErrorMessage,
} from "@/server/errors";

// Minimal shape that matches what the Vercel AI SDK surfaces for provider errors.
function makeApiCallError(statusCode: number, message = "Provider error"): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

// ---------------------------------------------------------------------------
// classifyError
// ---------------------------------------------------------------------------

describe("classifyError", () => {
  it("classifies 429 as RATE_LIMITED and passes through original message", () => {
    const result = classifyError(makeApiCallError(429, "Too many requests to provider"));
    expect(result.code).toBe("RATE_LIMITED");
    expect(result.httpStatus).toBe(429);
    expect(result.userMessage).toContain("Too many requests to provider");
  });

  it("classifies 401 as AUTH_ERROR", () => {
    const result = classifyError(makeApiCallError(401));
    expect(result.code).toBe("AUTH_ERROR");
    expect(result.httpStatus).toBe(401);
    expect(result.userMessage).toContain("misconfigured");
  });

  it("classifies 403 as AUTH_ERROR", () => {
    const result = classifyError(makeApiCallError(403));
    expect(result.code).toBe("AUTH_ERROR");
  });

  it("classifies 500 as PROVIDER_UNAVAILABLE and passes through original message", () => {
    const result = classifyError(makeApiCallError(500, "Provider down for maintenance"));
    expect(result.code).toBe("PROVIDER_UNAVAILABLE");
    expect(result.httpStatus).toBe(503);
    expect(result.userMessage).toContain("Provider down for maintenance");
  });

  it("classifies 503 as PROVIDER_UNAVAILABLE", () => {
    const result = classifyError(makeApiCallError(503));
    expect(result.code).toBe("PROVIDER_UNAVAILABLE");
  });

  it("classifies AbortError as TIMEOUT", () => {
    const err = new Error("The operation was aborted.");
    err.name = "AbortError";
    const result = classifyError(err);
    expect(result.code).toBe("TIMEOUT");
    expect(result.httpStatus).toBe(504);
  });

  it("classifies ETIMEDOUT message as TIMEOUT", () => {
    const err = new Error("connect ETIMEDOUT 1.2.3.4:443");
    const result = classifyError(err);
    expect(result.code).toBe("TIMEOUT");
  });

  it("falls back to UNKNOWN for unrecognised errors", () => {
    const result = classifyError(new Error("Something completely unexpected"));
    expect(result.code).toBe("UNKNOWN");
    expect(result.httpStatus).toBe(500);
  });

  it("handles non-Error thrown values gracefully", () => {
    const result = classifyError("a string was thrown");
    expect(result.code).toBe("UNKNOWN");
  });

  it("handles null gracefully", () => {
    const result = classifyError(null);
    expect(result.code).toBe("UNKNOWN");
  });
});

// ---------------------------------------------------------------------------
// buildErrorResponse
// ---------------------------------------------------------------------------

describe("buildErrorResponse", () => {
  it("returns HTTP 429 for a rate-limit error and includes provider message", async () => {
    const response = buildErrorResponse(makeApiCallError(429, "Provider limit reached"));
    expect(response.status).toBe(429);

    const body = await response.text();
    expect(body).toContain("Provider limit reached");
  });

  it("returns HTTP 401 for an auth error", async () => {
    const response = buildErrorResponse(makeApiCallError(401));
    expect(response.status).toBe(401);

    const body = await response.text();
    expect(body).toContain("misconfigured");
  });

  it("returns HTTP 503 for a provider outage", async () => {
    const response = buildErrorResponse(makeApiCallError(503));
    expect(response.status).toBe(503);
  });

  it("returns HTTP 500 for an unknown error", async () => {
    const response = buildErrorResponse(new Error("boom"));
    expect(response.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// getStreamErrorMessage
// ---------------------------------------------------------------------------

describe("getStreamErrorMessage", () => {
  it("returns the original provider string for a 429", () => {
    const msg = getStreamErrorMessage(makeApiCallError(429, "Custom rate limit message"));
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
    expect(msg).toContain("Custom rate limit message");
  });

  it("returns a fallback string for unknown errors", () => {
    const msg = getStreamErrorMessage(new Error("oops"));
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });
});
