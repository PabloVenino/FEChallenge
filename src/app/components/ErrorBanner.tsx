"use client";

import { AlertTriangleIcon } from "./Icons";

type Props = {
  /** The error received from useChat(). */
  error: Error;
  /** Called when the user dismisses the banner. */
  onDismiss: () => void;
};

/**
 * Dismissable inline error banner that appears between the message list and the
 * chat input when useChat() surfaces an error.
 *
 * The message comes from the server's `getErrorMessage` hook (errors.ts), so
 * it is always a human-readable sentence rather than a raw exception string.
 */
export function ErrorBanner({ error, onDismiss }: Props) {
  // The AI SDK sometimes prepends "Error: " to streamed errors, and defaults
  // to "An error occurred." if the server didn't provide a custom message.
  let message = error.message || "Something went wrong. Please try again.";
  
  if (message.startsWith("Error: ")) {
    message = message.slice(7).trim();
  }
  
  if (message === "An error occurred." || message === "An error occured") {
    message = "Something went wrong. Please try again.";
  }

  return (
    <div
      role="alert"
      className="mx-4 mb-2 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

      <p className="flex-1 leading-snug">{message}</p>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="ml-2 shrink-0 rounded-md p-0.5 text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        {/* Close × */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>
  );
}
