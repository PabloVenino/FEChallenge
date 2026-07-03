import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Display, Row } from "@/agent/artifact";
import { RowsTable } from "./RowsTable";

type Props = {
  output?: { rows?: Row[]; display?: Display };
};

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid #e4e4e7",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
  fontSize: "13px",
  fontWeight: 500,
};

export function ToolResultRenderer({ output }: Props) {
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
              <XAxis dataKey={display.x} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#71717a" }} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#71717a" }} />
              <Tooltip cursor={{ fill: "#f4f4f5" }} contentStyle={tooltipStyle} />
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
              <XAxis dataKey={display.x} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#71717a" }} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#71717a" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey={display.y} stroke="#18181b" strokeWidth={2} dot={{ r: 4, fill: "#18181b", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    case "table":
    default:
      return <RowsTable output={output} />;
  }
}