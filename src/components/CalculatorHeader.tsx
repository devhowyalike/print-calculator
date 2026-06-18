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
    } else if (m === "billboard") {
      onDimensionsChange(
        String(BILLBOARD_DEFAULT_WIDTH),
        String(BILLBOARD_DEFAULT_HEIGHT),
      );
    }
    // "reverse" keeps the print-size inputs it manages on its own.
  };

  const MODE_LABELS: Record<Mode, string> = {
    print: "Standard",
    billboard: "Billboard",
    reverse: "→ Pixels",
  };

  const MODE_DESCRIPTIONS: Record<Mode, string> = {
    print:
      "Common print sizes for handheld, arm's length and room-scale viewing.",
    billboard:
      "Large-format prints such as trade shows, storefronts and billboards.",
    reverse: "Input the print size and get the minimum pixels your file needs.",
  };

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center gap-2.5">
        <span className="text-sm">🖨️</span>
        <h1 className="font-mono text-3xl uppercase tracking-[1.5px] text-zinc-200">
          Pixel to Print Calculator
        </h1>
      </div>

      <h2 className="mt-1 mb-4 text-xl font-normal text-white text-pretty">
        {mode === "reverse"
          ? "Set a print size and target resolution to find exactly how many pixels your file needs."
          : "A tool for photographers, designers and artists to determine which print sizes their digital images can support at a given quality level."}
      </h2>

      <div className="mt-5 mb-1 flex flex-wrap items-center gap-1 rounded-2xl border border-white/6 bg-app-card-surface p-1 w-fit shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        {(["print", "billboard", "reverse"] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeClick(m)}
            className={`cursor-pointer rounded-lg px-4 py-[7px] text-sm font-medium transition-all duration-200 ${toggleButtonClass(mode === m)}`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <p className="mt-2 text-sm text-app-muted text-pretty">
        {MODE_DESCRIPTIONS[mode]}
      </p>

      {mode !== "reverse" && (
        <h3 className="mt-6 text-xl font-semibold leading-relaxed text-white">
          Source file dimensions
        </h3>
      )}
    </div>
  );
}
