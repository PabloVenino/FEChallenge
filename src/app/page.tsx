"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { getActiveRole, getActiveWorkspace, useTenant, useTRPC } from "./providers";
import { ChatPanel } from "./components/ChatPanel";
import PipelineSidebar from "./components/PipelineSidebar";
import { Toast } from "./components/Toast";

export default function Page() {
  const { activeWorkspace, setActiveWorkspace, role, setRole } = useTenant();
  const trpc = useTRPC();

  const workspaces = useQuery(trpc.workspaces.list.queryOptions());
  const pipeline = useQuery(trpc.analytics.applicationsByStage.queryOptions({}));

  const [toastError, setToastError] = useState<Error | null>(null);

  const pipelineError = pipeline.error as Error | null;
  useMemo(() => {
    if (pipelineError) setToastError(pipelineError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineError?.message]);

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

  const { messages, sendMessage, status, error: chatError, clearError } = useChat({
    id: `${activeWorkspace}:${role}`,
    transport,
  });

  const busy = status === "streaming" || status === "submitted";

  const handleSend = useCallback(
    (text: string) => {
      clearError?.();
      sendMessage({ text });
    },
    [sendMessage, clearError]
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
        error={chatError}
        onDismissError={clearError}
      />
      <PipelineSidebar data={pipeline.data} isLoading={pipeline.isLoading} />

      {/* Analytics (tRPC) errors surface here as a toast */}
      <Toast error={toastError} onDismiss={() => setToastError(null)} />
    </main>
  );
}

