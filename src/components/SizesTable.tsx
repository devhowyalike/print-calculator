import { COLORS } from "../lib/constants";
import { STATUS_CONFIG } from "../lib/calculator";
import type { SizeDataItem } from "../types";
import type { Mode } from "../types";

type SizesTableProps = {
  mode: Mode;
  data: SizeDataItem[];
};

export default function SizesTable({ mode, data }: SizesTableProps) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#1c1c21] bg-[#131316]">
      <div className="grid grid-cols-[70px_1fr_60px_60px] sm:grid-cols-[90px_1fr_80px_80px_80px] border-b border-[#1c1c21] px-4 sm:px-5 py-3 text-[11px] font-semibold uppercase tracking-[1px] text-zinc-600">
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
            className="grid grid-cols-[70px_1fr_60px_60px] sm:grid-cols-[90px_1fr_80px_80px_80px] items-center px-4 sm:px-5 py-[11px] transition-colors duration-300"
            style={{
              background: sc.bg,
              borderBottom:
                i < data.length - 1 ? `1px solid ${COLORS.border}` : "none",
            }}
          >
            <div className="font-mono text-sm font-semibold text-zinc-200">
              {item.displayName}
            </div>
            <div className="pr-3 sm:pr-5">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#1c1c21]">
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
              className="hidden sm:block text-right font-mono text-[13px] font-medium"
              style={{
                color:
                  item.effectiveDPI >= item.viewingPPI
                    ? COLORS.highlight
                    : COLORS.muted,
              }}
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
