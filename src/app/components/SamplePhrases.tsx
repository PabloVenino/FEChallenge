"use client";

import { useRef } from "react";

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

export default function QuickPhrases({
  onSelect,
}: {
  onSelect: (phrase: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-t border-zinc-200 bg-zinc-50/60 px-4 sm:px-6 py-3">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin [scrollbar-width:thin]"
      >
        {PHRASES.map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => onSelect(phrase)}
            className="shrink-0 whitespace-nowrap rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-zinc-600 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            {phrase}
          </button>
        ))}
      </div>
    </div>
  );
}
