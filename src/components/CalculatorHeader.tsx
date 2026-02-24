import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  BILLBOARD_DEFAULT_WIDTH,
  BILLBOARD_DEFAULT_HEIGHT,
  toggleButtonClass,
  type Mode,
} from "../lib/calculator";

type CalculatorHeaderProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onDimensionsChange: (width: string, height: string) => void;
  onAspectRatioReset: () => void;
};

export default function CalculatorHeader({
  mode,
  onModeChange,
  onDimensionsChange,
  onAspectRatioReset,
}: CalculatorHeaderProps) {
  const handleModeClick = (m: Mode) => {
    onModeChange(m);
    onAspectRatioReset();
    if (m === "print") {
      onDimensionsChange(String(DEFAULT_WIDTH), String(DEFAULT_HEIGHT));
    } else {
      onDimensionsChange(
        String(BILLBOARD_DEFAULT_WIDTH),
        String(BILLBOARD_DEFAULT_HEIGHT),
      );
    }
  };

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center gap-2.5">
        <span className="text-sm">🖨️</span>
        <h1 className="font-mono text-3xl uppercase tracking-[1.5px] bg-linear-to-r from-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Pixel to Print Calculator
        </h1>
      </div>

      <h2 className="mt-1 mb-4 text-xl font-normal text-white">
        A tool for photographers, designers and artists to determine which print
        sizes their digital images can support at a given quality level.
      </h2>

      <div className="mt-5 mb-1 flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-app-card-surface p-1 w-fit shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        {(["print", "billboard"] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeClick(m)}
            className={`cursor-pointer rounded-lg px-4 py-[7px] text-sm font-medium transition-all duration-200 ${toggleButtonClass(mode === m)}`}
          >
            {m === "print" ? "Standard Print" : "Billboard / Large Format"}
          </button>
        ))}
      </div>

      <h3 className="mt-6 text-xl font-semibold leading-relaxed text-white">
        Source file dimensions
      </h3>
    </div>
  );
}
