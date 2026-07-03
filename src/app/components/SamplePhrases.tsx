"use client";

import { useMemo, useState } from "react";

const PHRASES: string[] = [
  "How does my pipeline look by stage?",
  "Show candidates by source this month",
  "Which jobs have the most applicants?",
  "List candidates in the final interview stage",
  "What's our offer acceptance rate?",
  "Show time-to-hire by job",
  "Which sources produce the best hires?",
  "How many candidates were rejected last week?",
  "Show open jobs by department",
  "List candidates awaiting feedback",
  "What's our current headcount by role?",
  "Show application volume trend this quarter",
  "Which recruiters have the most active candidates?",
  "List candidates with upcoming interviews",
  "Show dropout rate by stage",
  "What jobs have been open longest?",
  "Show diversity breakdown of applicants",
  "List candidates flagged for follow-up",
  "What's the average time in each stage?",
  "Show hires by month this year",
];

const PAGE_SIZE = 3;

export function SamplePhrases({
  onSelect,
}: {
  onSelect: (phrase: string) => void;
}) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(PHRASES.length / PAGE_SIZE);

  const phrases = useMemo(() => {
    const start = page * PAGE_SIZE;
    return PHRASES.slice(start, start + PAGE_SIZE);
  }, [page]);

  const previous = () => {
    setPage((p) => (p === 0 ? totalPages - 1 : p - 1));
  };

  const next = () => {
    setPage((p) => (p === totalPages - 1 ? 0 : p + 1));
  };

  return (
    <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">
          Try asking...
        </span>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <button
            type="button"
            onClick={previous}
            className="rounded border border-zinc-200 px-2 py-1 transition hover:bg-zinc-100"
          >
            ←
          </button>

          <span>
            {page + 1} / {totalPages}
          </span>

          <button
            type="button"
            onClick={next}
            className="rounded border border-zinc-200 px-2 py-1 transition hover:bg-zinc-100"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {phrases.map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => onSelect(phrase)}
            className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            {phrase}
          </button>
        ))}
      </div>
    </div>
  );
}