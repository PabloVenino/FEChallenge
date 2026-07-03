import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { EmptyPipelineIcon } from "./Icons";

type PipelineRow = { stage: string; count: number };

type Props = {
  data: PipelineRow[] | undefined;
  isLoading: boolean;
};

export function PipelineSidebar({ data, isLoading }: Props) {
  const total = data?.reduce((acc, curr) => acc + curr.count, 0) ?? 0;

  return (
    <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto w-full md:w-auto md:w-80 lg:w-96">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm w-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">Pipeline (this workspace)</h2>
          {data && data.length > 0 && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{total} total</span>
          )}
        </div>

        {isLoading ? (
          <PipelineSkeleton />
        ) : data && data.length > 0 ? (
          <div className="mt-2 w-full" style={{ height: Math.max(192, data.length * 48) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} fontSize={12} width={80} />
                <Tooltip cursor={{ fill: "#f3f4f6" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={24}>
                  <LabelList dataKey="count" position="right" fontSize={12} fill="#6b7280" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <PipelineEmpty />
        )}
      </div>
    </aside>
  );
}

function PipelineSkeleton() {
  return (
    <div className="mt-2 flex flex-col gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex h-8 items-center gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-6 flex-1 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function PipelineEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-200 py-8 text-center mt-2">
      <EmptyPipelineIcon className="mb-2 text-gray-300" />
      <p className="text-sm font-medium text-gray-900">No candidates</p>
      <p className="mt-1 text-xs text-gray-500">Pipeline is currently empty.</p>
    </div>
  );
}