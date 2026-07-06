import type { UIMessage } from "ai";
import { ROLES } from "@/db/permissions";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { SamplePhrases } from "./SamplePhrases";
import { ErrorBanner } from "./ErrorBanner";
import { useMemo } from "react";

type Workspace = { id: string; slug: string; name: string };

type Props = {
  workspaces: Workspace[] | undefined;
  activeWorkspace: string;
  onWorkspaceChange: (slug: string) => void;
  role: (typeof ROLES)[number];
  onRoleChange: (role: (typeof ROLES)[number]) => void;
  messages: UIMessage[];
  busy: boolean;
  onSend: (text: string) => void;
  /** Error surfaced by useChat() — shown as an inline banner above the input. */
  error?: Error | null;
  /** Called when the user dismisses the error banner. */
  onDismissError?: () => void;
};

export function ChatPanel({
  workspaces,
  activeWorkspace,
  onWorkspaceChange,
  role,
  onRoleChange,
  messages,
  busy,
  onSend,
  error,
  onDismissError,
}: Props) {
  const workspaceName = useMemo(
    () => workspaces?.find((w) => w.slug === activeWorkspace)?.name ?? activeWorkspace, [workspaces, activeWorkspace]
  );

  const userLabel = useMemo(() => `You (${workspaceName} - ${role})`, [workspaceName, role]);

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <ChatHeader
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={onWorkspaceChange}
        role={role}
        onRoleChange={onRoleChange}
      />
      <MessageList messages={messages} busy={busy} userLabel={userLabel} />
      {error && onDismissError && (
        <ErrorBanner error={error} onDismiss={onDismissError} />
      )}
      <SamplePhrases onSelect={(phrase) => onSend(phrase)} />
      <ChatInput busy={busy} onSend={onSend} />
    </section>
  );
}