import { STATUS_CONFIG, type SizeDataItem, type Mode } from "../lib/calculator";

type SizesTableProps = {
  mode: Mode;
  data: SizeDataItem[];
};

export default function SizesTable({ mode, data }: SizesTableProps) {
  return (
    <div className="rounded-2xl border border-white/6 bg-app-card-surface shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="grid grid-cols-[70px_1fr_60px_60px] sm:grid-cols-[90px_1fr_80px_80px_80px] border-b border-white/4 px-4 sm:px-5 py-3 text-[11px] font-semibold uppercase tracking-[1px] text-zinc-600">
        <div>Size</div>
        <div>Coverage</div>
        <div className="text-right">Your PPI</div>
        <div className="text-right sm:hidden">Quality</div>
        <div className="hidden sm:block text-right">
          {mode === "print" ? "Min PPI" : "Req. PPI"}
        </div>
        <div className="hidden sm:block text-right">Quality</div>
      </div>

      {data.map((item, i) => {
        const sc = STATUS_CONFIG[item.status];
        const coveragePercent = Math.min(
          (item.effectiveDPI / item.targetDpi) * 100,
          100,
        );
        return (
          <div
            key={item.name}
            className={`grid grid-cols-[70px_1fr_60px_60px] sm:grid-cols-[90px_1fr_80px_80px_80px] items-center px-4 sm:px-5 py-[11px] transition-colors duration-300 ${i < data.length - 1 ? "border-b border-white/4" : ""}`}
            style={{ background: sc.bg }}
          >
            <div className="font-mono text-sm font-semibold text-zinc-200">
              {item.displayName}
            </div>
            <div className="pr-3 sm:pr-5">
              <div className="h-1.5 overflow-hidden rounded-full bg-app-card">
                <div
                  className="h-full rounded-full opacity-70 transition-[width] duration-400 ease-out"
                  style={{
                    width: `${coveragePercent}%`,
                    background: sc.color,
                  }}
                />
              </div>
            </div>
            <div
              className="text-right font-mono text-[13px] font-medium"
              style={{ color: sc.color }}
            >
              {item.effectiveDPI}
            </div>
            <div
              className="flex sm:hidden items-center justify-end"
              style={{ color: sc.color }}
            >
              <span
                className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: `${sc.color}18` }}
              >
                {sc.icon}
              </span>
            </div>
            <div
              className={`hidden sm:block text-right font-mono text-[13px] font-medium ${
                item.effectiveDPI >= item.viewingPPI
                  ? "text-app-highlight"
                  : "text-app-muted"
              }`}
            >
              {item.viewingPPI}
            </div>
            <div
              className="hidden sm:flex items-center justify-end gap-[5px] text-right text-xs font-medium"
              style={{ color: sc.color }}
            >
              <span
                className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: `${sc.color}18` }}
              >
                {sc.icon}
              </span>
              {sc.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
