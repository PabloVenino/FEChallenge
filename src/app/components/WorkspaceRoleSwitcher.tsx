import { ROLES } from "@/db/permissions";

type Workspace = { id: string; slug: string; name: string };

type Props = {
  workspaces: Workspace[] | undefined;
  activeWorkspace: string;
  onWorkspaceChange: (slug: string) => void;
  role: (typeof ROLES)[number];
  onRoleChange: (role: (typeof ROLES)[number]) => void;
};

const selectClass =
  "rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900";

export function WorkspaceRoleSwitcher({
  workspaces,
  activeWorkspace,
  onWorkspaceChange,
  role,
  onRoleChange,
}: Props) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <label className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-zinc-500">Workspace</span>
        <select
          className={selectClass}
          value={activeWorkspace}
          onChange={(e) => onWorkspaceChange(e.target.value)}
        >
          {workspaces?.map((w) => (
            <option key={w.id} value={w.slug}>
              {w.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-zinc-500">Role</span>
        <select
          className={selectClass}
          value={role}
          onChange={(e) => onRoleChange(e.target.value as (typeof ROLES)[number])}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}