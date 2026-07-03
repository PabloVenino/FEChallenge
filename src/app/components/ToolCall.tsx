import type { Display, Row } from "@/agent/artifact";
import { CheckIcon, ErrorIcon, ToolSpinnerIcon } from "./Icons";
import { ToolResultRenderer } from "./ToolResultRenderer";

type ToolPart = {
  type: string;
  state?: string;
  input?: unknown;
  output?: { rows?: Row[]; display?: Display };
  errorText?: string;
};

const TOOL_NAMES: Record<string, string> = {
  applicationCountByStage: "Applications by Stage",
  candidatesBySource: "Candidates by Source",
  jobBreakdown: "Job Breakdown",
  listCandidates: "Candidate List",
  getCandidateDetail: "Candidate Detail",
};

export function ToolCall({ part }: { part: unknown }) {
  const p = part as ToolPart;
  const rawName = p.type.replace(/^tool-/, "");
  const name = TOOL_NAMES[rawName] || rawName;
  const done = p.state === "output-available";
  const errored = p.state === "output-error";

  return (
    <div
      className={`overflow-hidden rounded-xl border ${errored ? "border-red-200 bg-red-50/50" : "border-zinc-200 bg-white"} text-[14px] shadow-sm transition-all duration-300 hover:shadow-md ${!done && !errored && "animate-pulse"}`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 ${done && !errored ? "border-b border-zinc-100 bg-zinc-50/50" : ""}`}>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg border ${errored ? "bg-red-100 border-red-200 text-red-600" : done ? "bg-zinc-100 border-zinc-200 text-zinc-600" : "bg-blue-50 border-blue-100 text-blue-600"
            }`}
        >
          {errored ? <ErrorIcon /> : done ? <CheckIcon /> : <ToolSpinnerIcon />}
        </div>
        <div className="flex flex-col">
          <span className={`font-semibold tracking-tight ${errored ? "text-red-900" : "text-zinc-900"}`}>{name}</span>
          {!done && !errored && <span className="text-[12px] text-zinc-500">Executing tool...</span>}
        </div>
      </div>
      {errored && <div className="px-4 pb-3 pt-1 text-[13px] text-red-600 font-medium">{p.errorText}</div>}
      {done && !errored && (
        <div className="p-4 bg-white animate-in fade-in slide-in-from-top-1 duration-500">
          <ToolResultRenderer output={p.output} />
        </div>
      )}
    </div>
  );
}