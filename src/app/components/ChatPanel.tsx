import type { UIMessage } from "ai";
import { ROLES } from "@/db/permissions";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

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
}: Props) {
  const workspaceName = workspaces?.find((w) => w.slug === activeWorkspace)?.name ?? activeWorkspace;

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <ChatHeader
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={onWorkspaceChange}
        role={role}
        onRoleChange={onRoleChange}
      />
      <MessageList messages={messages} busy={busy} userLabel={`You (${workspaceName} - ${role})`} />
      <ChatInput busy={busy} onSend={onSend} />
    </section>
  );
}