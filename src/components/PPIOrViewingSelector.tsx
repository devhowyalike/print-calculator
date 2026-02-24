import { PPI_OPTIONS, getPPIDescription } from "../lib/constants";
import { VIEWING_PRESETS } from "../lib/calculator";

type ViewingPreset = (typeof VIEWING_PRESETS)[number];

type PPIOrViewingSelectorProps =
  | {
      mode: "print";
      dpi: number;
      onDpiChange: (dpi: number) => void;
    }
  | {
      mode: "billboard";
      viewingDistanceFt: number;
      onViewingDistanceChange: (ft: number) => void;
      currentPreset: ViewingPreset | undefined;
      currentPresetPPI: number;
    };

export default function PPIOrViewingSelector(
  props: PPIOrViewingSelectorProps,
) {
  if (props.mode === "print") {
    return (
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-zinc-800 bg-[#131316] px-[18px] py-3.5">
        <span className="whitespace-nowrap text-[13px] font-medium text-zinc-500">
          Target PPI
        </span>
        <div className="flex gap-1.5">
          {PPI_OPTIONS.map((val) => (
            <button
              key={val}
              onClick={() => props.onDpiChange(val)}
              className={`cursor-pointer rounded-lg px-[18px] py-[7px] font-mono text-sm font-medium transition-all duration-200 ${
                props.dpi === val
                  ? "border border-zinc-700 bg-[#1c1c21] text-zinc-200"
                  : "border border-transparent bg-transparent text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
        <span className="hidden sm:block flex-1" />
        <span className="text-sm text-white">{getPPIDescription(props.dpi)}</span>
      </div>
    );
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-zinc-800 bg-[#131316] px-[18px] py-3.5">
      <span className="whitespace-nowrap text-[13px] font-medium text-zinc-500">
        Viewing Distance
      </span>
      <div className="flex gap-1.5">
        {VIEWING_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => props.onViewingDistanceChange(preset.distanceFt)}
            className={`cursor-pointer rounded-lg px-[18px] py-[7px] text-sm font-medium transition-all duration-200 ${
              props.viewingDistanceFt === preset.distanceFt
                ? "border border-zinc-700 bg-[#1c1c21] text-zinc-200"
                : "border border-transparent bg-transparent text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <span className="hidden sm:block flex-1" />
      <span className="text-sm text-white">
        {props.currentPreset?.description ?? ""} (~{props.viewingDistanceFt} ft)
        {" \u2014 "}
        <span className="font-mono text-zinc-400">
          {props.currentPresetPPI} PPI target
        </span>
      </span>
    </div>
  );
}
