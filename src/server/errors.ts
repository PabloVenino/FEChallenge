/**
 * Centralised error classifier.
 *
 * Maps thrown values — particularly Vercel AI SDK `APICallError` instances and
 * plain `Error`s — to user-facing messages and HTTP status codes. Consumed by:
 *   - the `/api/chat` route (both the streaming `getErrorMessage` hook and the
 *     outer try/catch for pre-stream errors)
 *   - the tRPC `errorFormatter` for analytics query failures
 */

/** Discriminated codes for the error categories we care about. */
export type ErrorCode =
  | "RATE_LIMITED"
  | "AUTH_ERROR"
  | "PROVIDER_UNAVAILABLE"
  | "TIMEOUT"
  | "BAD_REQUEST"
  | "UNKNOWN";

export type ClassifiedError = {
  code: ErrorCode;
  /** Short, human-readable sentence shown directly in the UI. */
  userMessage: string;
  /** HTTP status to use when building a Response. */
  httpStatus: number;
};

const MESSAGES: Record<ErrorCode, string> = {
  RATE_LIMITED:
    "You've hit the AI usage limit. Please wait a moment and try again.",
  AUTH_ERROR:
    "The AI service is misconfigured. Please contact support.",
  PROVIDER_UNAVAILABLE:
    "The AI service is temporarily unavailable. Please try again shortly.",
  TIMEOUT:
    "The request timed out. Please try again.",
  BAD_REQUEST:
    "Your message could not be sent. Please try again.",
  UNKNOWN:
    "Something went wrong. Please try again.",
};

/**
 * Classify any thrown value into a `ClassifiedError`.
 *
 * Detection order:
 *  1. Vercel AI SDK `APICallError` — has a numeric `.statusCode`.
 *  2. Abort / timeout signals.
 *  3. HTTP status embedded in generic `Error` messages (fallback for gateways
 *     that wrap errors as plain strings).
 *  4. Everything else → UNKNOWN.
 */
export function classifyError(err: unknown): ClassifiedError {
  // Vercel AI SDK wraps failed retries in an AI_RetryError containing the last error.
  if (isRetryError(err)) {
    return classifyError(err.lastError);
  }

  // Vercel AI SDK wraps provider HTTP errors as objects with statusCode.
  if (isApiCallError(err)) {
    return fromStatusCode(err.statusCode, err.message);
  }

  if (err instanceof Error) {
    // AbortError covers both native fetch timeouts and provider SDK timeouts.
    if (err.name === "AbortError" || /timeout|ETIMEDOUT/i.test(err.message)) {
      return { code: "TIMEOUT", userMessage: MESSAGES.TIMEOUT, httpStatus: 504 };
    }

    // Some gateways surface the upstream HTTP code in the error message.
    const statusMatch = err.message.match(/\b(4\d{2}|5\d{2})\b/);
    if (statusMatch) {
      return fromStatusCode(Number(statusMatch[1]), err.message);
    }
  }

  return { code: "UNKNOWN", userMessage: MESSAGES.UNKNOWN, httpStatus: 500 };
}

/**
 * `getErrorMessage` callback compatible with Vercel AI SDK's
 * `toUIMessageStreamResponse({ getErrorMessage })`. Receives the thrown error
 * and MUST return a plain string — the SDK streams it as an error part.
 */
export function getStreamErrorMessage(err: unknown): string {
  return classifyError(err).userMessage;
}

/**
 * Build a JSON `Response` from any thrown value, used for pre-stream errors
 * caught by the outer try/catch in the chat route.
 */
export function buildErrorResponse(err: unknown): Response {
  const { userMessage, httpStatus } = classifyError(err);
  return new Response(userMessage, { status: httpStatus });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fromStatusCode(status: number, originalMessage?: string): ClassifiedError {
  // We prefer the original provider message (if any) for rate limits and outages,
  // as it often contains helpful reality (e.g. "Spikes in demand are temporary").
  if (status === 429) {
    return { code: "RATE_LIMITED", userMessage: originalMessage || MESSAGES.RATE_LIMITED, httpStatus: 429 };
  }
  if (status === 401 || status === 403) {
    // Hide raw API key errors from end users.
    return { code: "AUTH_ERROR", userMessage: MESSAGES.AUTH_ERROR, httpStatus: 401 };
  }
  if (status === 400) {
    return { code: "BAD_REQUEST", userMessage: MESSAGES.BAD_REQUEST, httpStatus: 400 };
  }
  if (status >= 500) {
    return { code: "PROVIDER_UNAVAILABLE", userMessage: originalMessage || MESSAGES.PROVIDER_UNAVAILABLE, httpStatus: 503 };
  }
  return { code: "UNKNOWN", userMessage: MESSAGES.UNKNOWN, httpStatus: 500 };
}

/** Type guard for Vercel AI SDK `APICallError` (duck-typed to avoid import). */
function isApiCallError(err: unknown): err is { statusCode: number; message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof (err as { statusCode: unknown }).statusCode === "number"
  );
}

/** Type guard for Vercel AI SDK `AI_RetryError` (duck-typed). */
function isRetryError(err: unknown): err is { lastError: unknown } {
  return (
    typeof err === "object" &&
    err !== null &&
    "lastError" in err
  );
}
