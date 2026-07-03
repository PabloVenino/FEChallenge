import { ROLES } from "@/db/permissions";
import { WorkspaceRoleSwitcher } from "./WorkspaceRoleSwitcher";

type Workspace = { id: string; slug: string; name: string };

type Props = {
  workspaces: Workspace[] | undefined;
  activeWorkspace: string;
  onWorkspaceChange: (slug: string) => void;
  role: (typeof ROLES)[number];
  onRoleChange: (role: (typeof ROLES)[number]) => void;
};

export function ChatHeader(props: Props) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 bg-white z-10 shadow-sm">
      <div>
        <h1 className="text-[17px] font-semibold text-zinc-900 tracking-tight">ATS Analytics Copilot</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">Chat with this workspace&rsquo;s recruiting data.</p>
      </div>
      <WorkspaceRoleSwitcher {...props} />
    </header>
  );
}