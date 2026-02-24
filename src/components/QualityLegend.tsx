import { STATUS_CONFIG } from "../lib/calculator";
import type { Status } from "../lib/calculator";

type QualityLegendProps = {
  activeDpi: number;
};

export default function QualityLegend({ activeDpi }: QualityLegendProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
      {(
        Object.entries(STATUS_CONFIG) as [
          Status,
          (typeof STATUS_CONFIG)[Status],
        ][]
      ).map(([key, val]) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: val.color }}
          />
          <span className="text-sm text-zinc-200">
            <span className="font-medium" style={{ color: val.color }}>
              {val.label}
            </span>
            {" — "}
            {key === "perfect"
              ? `≥ ${activeDpi} PPI (meets target)`
              : key === "acceptable"
                ? `≥ ${Math.round(activeDpi * 0.85)} PPI (near target)`
                : key === "stretch"
                  ? `≥ ${Math.round(activeDpi * 0.6)} PPI (needs more pixels)`
                  : `< ${Math.round(activeDpi * 0.6)} PPI (not enough pixels)`}
          </span>
        </div>
      ))}
    </div>
  );
}
