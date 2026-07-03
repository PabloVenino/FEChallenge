"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { getActiveRole, getActiveWorkspace, useTenant, useTRPC } from "./providers";
import { ChatPanel } from "./components/ChatPanel";
import PipelineSidebar from "./components/PipelineSidebar";

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

  const busy = status === "streaming" || status === "submitted";

  const handleSend = useCallback(
    (text: string) => {
      sendMessage({ text });
    },
    [sendMessage]
  );

  return (
    <main className="mx-auto grid h-screen max-w-[1400px] grid-cols-1 md:grid-cols-[1fr_360px] gap-6 p-4 md:p-6 bg-zinc-50/50">
      <ChatPanel
        workspaces={workspaces.data}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={setActiveWorkspace}
        role={role}
        onRoleChange={setRole}
        messages={messages}
        busy={busy}
        onSend={handleSend}
      />
      <PipelineSidebar data={pipeline.data} isLoading={pipeline.isLoading} />
    </main>
  );
}
