import { BotIcon } from "./Icons";

export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start mt-6 animate-in fade-in duration-300">
      <div className="flex gap-3 max-w-[85%]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-blue-600 border-blue-700 text-white shadow-sm">
          <BotIcon />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-[13px] font-medium text-zinc-500 mb-1 px-1">BW-Recruiter</span>
          <div className="flex items-center gap-1.5 px-4 py-4 bg-white border border-zinc-200 rounded-2xl rounded-tl-sm shadow-sm">
            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
