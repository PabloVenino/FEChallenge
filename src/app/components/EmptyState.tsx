import { BotIcon } from "./Icons";

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200">
        <BotIcon size={24} className="text-zinc-500" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900">ATS Analytics Copilot</h3>
      <p className="mt-1 max-w-[280px] text-[13px] text-zinc-500">
        Ask about this workspace &mdash; e.g. &ldquo;How does my pipeline look by stage?&rdquo;
      </p>
    </div>
  );
}