"use client";

import { useEffect, useRef } from "react";
import { AlertTriangleIcon } from "./Icons";

type ToastProps = {
  /** The error to display. `null` = hidden. */
  error: Error | null;
  /** Called when the toast auto-dismisses or the user closes it. */
  onDismiss: () => void;
  /** Auto-dismiss delay in ms. Default: 6000 */
  duration?: number;
};

/**
 * Fixed-position toast notification that appears at the bottom-right of the
 * viewport when a tRPC analytics query fails.
 *
 * - Auto-dismisses after `duration` ms (default 6 s).
 * - User can also dismiss manually with the × button.
 * - Enters with a slide-up + fade animation.
 * - `null` error = nothing rendered.
 */
export function Toast({ error, onDismiss, duration = 6000 }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!error) return;

    timerRef.current = setTimeout(onDismiss, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [error, duration, onDismiss]);

  if (!error) return null;
  
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
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 flex w-80 items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
        <AlertTriangleIcon className="h-4 w-4 text-red-500" />
      </div>

      <div className="flex-1 pt-0.5">
        <p className="text-sm font-medium text-zinc-900">Analytics error</p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{message}</p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300"
      >
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
