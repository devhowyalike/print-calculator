import type { SizeDataItem, Mode } from "../lib/calculator";

type SummaryCardsProps = {
  mode: Mode;
  data: SizeDataItem[];
  excellentCount: number;
  lastExcellent: SizeDataItem | undefined;
};

export default function SummaryCards({
  mode,
  data,
  excellentCount,
  lastExcellent,
}: SummaryCardsProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <div className="min-w-[160px] flex-1 rounded-[10px] border border-app-card bg-app-bg px-[18px] py-3.5">
        <div className="mb-1 text-[11px] uppercase tracking-[1px] text-zinc-600">
          {mode === "print" ? "Printable sizes" : "Usable sizes"}
        </div>
        <div className="text-2xl font-bold text-green-500">
          {excellentCount}
          <span className="text-sm font-normal text-zinc-600">
            {" "}
            / {data.length}
          </span>
        </div>
      </div>
      <div className="min-w-[160px] flex-1 rounded-[10px] border border-app-card bg-app-bg px-[18px] py-3.5">
        <div className="mb-1 text-[11px] uppercase tracking-[1px] text-zinc-600">
          Largest excellent
        </div>
        <div className="text-2xl font-bold text-zinc-200">
          {lastExcellent ? lastExcellent.displayName : "—"}
        </div>
      </div>
      <div className="min-w-[160px] flex-1 rounded-[10px] border border-app-card bg-app-bg px-[18px] py-3.5">
        <div className="mb-1 text-[11px] uppercase tracking-[1px] text-zinc-600">
          PPI at largest usable size
        </div>
        <div className="font-mono text-2xl font-bold text-zinc-400">
          {lastExcellent ? lastExcellent.effectiveDPI : "—"}
        </div>
      </div>
    </div>
  );
}
