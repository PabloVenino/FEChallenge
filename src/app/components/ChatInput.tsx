import { useState } from "react";
import { SendIcon, SpinnerIcon } from "./Icons";

type Props = {
  busy: boolean;
  onSend: (text: string) => void;
};

export function ChatInput({ busy, onSend }: Props) {
  const [input, setInput] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    onSend(text);
    setInput("");
  }

  return (
    <div className="border-t border-zinc-200 bg-white p-4 sm:p-6">
      <form
        onSubmit={submit}
        className="relative flex items-end rounded-xl border border-zinc-300 bg-white shadow-sm focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-100 transition-all"
      >
        <textarea
          rows={1}
          className="flex-1 max-h-32 min-h-[52px] w-full resize-none bg-transparent px-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
          placeholder="Ask the analytics copilot…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e as unknown as React.FormEvent);
            }
          }}
        />
        <div className="p-2">
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white transition-all hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400"
            aria-label="Send message"
          >
            {busy ? <SpinnerIcon size={20} /> : <SendIcon />}
          </button>
        </div>
      </form>
      <div className="mt-2 text-center text-[11px] text-zinc-500 font-medium">AI can make mistakes. Check important recruiting data.</div>
    </div>
  );
}
