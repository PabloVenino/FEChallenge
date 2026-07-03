"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";

import { ROLES } from "@/db/permissions";
import type { Display, Row } from "@/agent/artifact";
import {
  getActiveRole,
  getActiveWorkspace,
  useTenant,
  useTRPC,
} from "./providers";

export default function Page() {
  const { activeWorkspace, setActiveWorkspace, role, setRole } = useTenant();
  const trpc = useTRPC();

  const workspaces = useQuery(trpc.workspaces.list.queryOptions());
  const pipeline = useQuery(trpc.analytics.applicationsByStage.queryOptions({}));

  // A fresh transport per active workspace/role so the `x-workspace` + `x-role`
  // headers follow the switchers. Keying useChat on them also resets the
  // conversation when you switch tenant or role.
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: () => ({
          "x-workspace": getActiveWorkspace(),
          "x-role": getActiveRole(),
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeWorkspace, role],
  );

  const { messages, sendMessage, status } = useChat({
    id: `${activeWorkspace}:${role}`,
    transport,
  });

  const [input, setInput] = useState("");
  const busy = status === "streaming" || status === "submitted";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <main className="mx-auto grid h-screen max-w-[1400px] grid-cols-1 md:grid-cols-[1fr_360px] gap-6 p-4 md:p-6 bg-zinc-50/50">
      {/* Conversation column */}
      <section className="flex min-h-0 flex-col rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 bg-white z-10 shadow-sm">
          <div>
            <h1 className="text-[17px] font-semibold text-zinc-900 tracking-tight">ATS Analytics Copilot</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Chat with this workspace&rsquo;s recruiting data.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-zinc-500">Workspace</span>
              <select
                className="rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                value={activeWorkspace}
                onChange={(e) => setActiveWorkspace(e.target.value)}
              >
                {workspaces.data?.map((w) => (
                  <option key={w.id} value={w.slug}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-zinc-500">Role</span>
              <select
                className="rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                value={role}
                onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><rect width="16" height="12" x="4" y="8" rx="2" ry="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/><path d="M12 8V4H8"/></svg>
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">ATS Analytics Copilot</h3>
              <p className="mt-1 max-w-[280px] text-[13px] text-zinc-500">
                Ask about this workspace &mdash; e.g. &ldquo;How does my pipeline look by stage?&rdquo;
              </p>
            </div>
          )}

          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const isSameSenderAsPrevious = index > 0 && messages[index - 1].role === message.role;
            const textParts = message.parts.filter((p) => p.type === "text");
            const toolParts = message.parts.filter((p) => p.type.startsWith("tool-"));
            
            return (
              <div 
                key={message.id} 
                className={`flex w-full ${isUser ? "justify-end" : "justify-start"} ${isSameSenderAsPrevious ? "mt-2" : "mt-6"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex w-full max-w-full sm:max-w-[85%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* Avatar */}
                  {!isSameSenderAsPrevious ? (
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isUser ? "bg-zinc-100 border-zinc-200 text-zinc-600" : "bg-blue-600 border-blue-700 text-white shadow-sm"}`}>
                      {isUser ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="12" x="4" y="8" rx="2" ry="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/><path d="M12 8V4H8"/></svg>
                      )}
                    </div>
                  ) : (
                    <div className="w-8 shrink-0" />
                  )}

                  {/* Message Content */}
                  <div className={`flex flex-col gap-1 w-full ${isUser ? "items-end" : "items-start"}`}>
                    {!isSameSenderAsPrevious && (
                      <span className="text-[13px] font-medium text-zinc-500 mb-1 px-1">
                        {isUser ? `You (${workspaces.data?.find(w => w.slug === activeWorkspace)?.name || activeWorkspace} - ${role})` : "BW-Recruiter"}
                      </span>
                    )}

                    {/* Text Parts */}
                    {textParts.map((part, i) => (
                      <div
                        key={`text-${i}`}
                        className={`px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                          isUser 
                            ? "bg-zinc-900 text-white rounded-2xl rounded-tr-sm" 
                            : "bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{part.text}</p>
                      </div>
                    ))}

                    {/* Tool Parts */}
                    {toolParts.map((part, i) => (
                      <div key={`tool-${i}`} className={`mt-1 w-full ${!isUser && "sm:max-w-[440px]"}`}>
                        <ToolCall part={part} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {busy && (
            <div className="flex w-full justify-start mt-6 animate-in fade-in duration-300">
               <div className="flex gap-3 max-w-[85%]">
                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-blue-600 border-blue-700 text-white shadow-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="12" x="4" y="8" rx="2" ry="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/><path d="M12 8V4H8"/></svg>
                 </div>
                 <div className="flex flex-col items-start gap-1">
                   <span className="text-[13px] font-medium text-zinc-500 mb-1 px-1">BW-Recruiter</span>
                   <div className="flex items-center gap-1.5 px-4 py-4 bg-white border border-zinc-200 rounded-2xl rounded-tl-sm shadow-sm">
                     <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>

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
                {busy ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                )}
              </button>
            </div>
          </form>
          <div className="mt-2 text-center text-[11px] text-zinc-500 font-medium">
            AI can make mistakes. Check important recruiting data.
          </div>
        </div>
      </section>

      {/* Side panel: a reference scoped read via tRPC (pipeline by stage). */}
      <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto w-full md:w-auto md:w-80 lg:w-96">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm w-full">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">Pipeline (this workspace)</h2>
            {pipeline.data && pipeline.data.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {pipeline.data.reduce((acc, curr) => acc + curr.count, 0)} total
              </span>
            )}
          </div>

          {pipeline.isLoading ? (
            <div className="mt-2 flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex h-8 items-center gap-2">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-6 flex-1 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : pipeline.data && pipeline.data.length > 0 ? (
            <div className="mt-2 w-full" style={{ height: Math.max(192, pipeline.data.length * 48) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline.data} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} fontSize={12} width={80} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={24}>
                    <LabelList dataKey="count" position="right" fontSize={12} fill="#6b7280" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-200 py-8 text-center mt-2">
              <svg className="mb-2 h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm font-medium text-gray-900">No candidates</p>
              <p className="mt-1 text-xs text-gray-500">Pipeline is currently empty.</p>
            </div>
          )}
        </div>
      </aside>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Tool-call rendering.
// ---------------------------------------------------------------------------
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

function ToolCall({ part }: { part: unknown }) {
  const p = part as ToolPart;
  const rawName = p.type.replace(/^tool-/, "");
  const name = TOOL_NAMES[rawName] || rawName;
  const done = p.state === "output-available";
  const errored = p.state === "output-error";

  return (
    <div className={`overflow-hidden rounded-xl border ${errored ? 'border-red-200 bg-red-50/50' : 'border-zinc-200 bg-white'} text-[14px] shadow-sm transition-all duration-300 hover:shadow-md ${!done && !errored && 'animate-pulse'}`}>
      <div className={`flex items-center gap-3 px-4 py-3 ${done && !errored ? 'border-b border-zinc-100 bg-zinc-50/50' : ''}`}>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${errored ? 'bg-red-100 border-red-200 text-red-600' : done ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
          {errored ? (
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          ) : done ? (
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          ) : (
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          )}
        </div>
        <div className="flex flex-col">
          <span className={`font-semibold tracking-tight ${errored ? 'text-red-900' : 'text-zinc-900'}`}>{name}</span>
          {!done && !errored && (
             <span className="text-[12px] text-zinc-500">Executing tool...</span>
          )}
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

function ToolResultRenderer({ output }: { output?: { rows?: Row[]; display?: Display } }) {
  const rows = output?.rows ?? [];
  if (rows.length === 0) return <p className="mt-1 text-gray-400">No rows.</p>;

  const display = output?.display;
  if (!display) return <RowsTable output={output} />;

  switch (display.kind) {
    case "bar":
      return (
        <div className="h-64 w-full">
          <h3 className="mb-4 text-[13px] font-semibold text-zinc-700 tracking-tight">{display.title}</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey={display.x} fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#71717a'}} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#71717a'}} />
              <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '13px', fontWeight: 500 }} />
              <Bar dataKey={display.y} fill="#18181b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    case "line":
      return (
        <div className="h-64 w-full">
          <h3 className="mb-4 text-[13px] font-semibold text-zinc-700 tracking-tight">{display.title}</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey={display.x} fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#71717a'}} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#71717a'}} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '13px', fontWeight: 500 }} />
              <Line type="monotone" dataKey={display.y} stroke="#18181b" strokeWidth={2} dot={{ r: 4, fill: '#18181b', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    case "table":
    default:
      return <RowsTable output={output} />;
  }
}

function RowsTable({ output }: { output?: { rows?: Row[]; display?: Display } }) {
  const rows = output?.rows ?? [];
  if (rows.length === 0) return <p className="mt-1 text-zinc-500 text-[13px]">No rows.</p>;

  const display = output?.display;
  const columns =
    display && display.kind === "table"
      ? display.columns
      : Object.keys(rows[0]);

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead className="bg-zinc-50/80">
          <tr className="text-zinc-500">
            {columns.map((c) => (
              <th key={c} className="border-b border-zinc-200 px-4 py-2.5 font-medium whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((row, i) => (
            <tr key={i} className="text-zinc-700 hover:bg-zinc-50 transition-colors">
              {columns.map((c) => (
                <td key={c} className="border-b border-zinc-100 px-4 py-2.5">
                  {String(row[c] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 8 && (
        <div className="bg-zinc-50/80 px-4 py-2.5 text-[12px] text-zinc-500 border-t border-zinc-200">
          Showing 8 of {rows.length} rows
        </div>
      )}
    </div>
  );
}
