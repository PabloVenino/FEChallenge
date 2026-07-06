import type { Display, Row } from "@/agent/artifact";

type Props = {
  output?: { rows?: Row[]; display?: Display };
};

function formatCellValue(val: unknown): string {
  if (typeof val === "string") {
    const isIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(val);
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(val);
    if (isIso || isDateOnly) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }).format(d);
      }
    }
  }
  return String(val ?? "");
}

export function RowsTable({ output }: Props) {
  const rows = output?.rows ?? [];
  if (rows.length === 0) return <p className="mt-1 text-zinc-500 text-[13px]">No rows.</p>;

  const display = output?.display;
  const columns = display && display.kind === "table" ? display.columns : Object.keys(rows[0]);

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
                  {formatCellValue(row[c])}
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