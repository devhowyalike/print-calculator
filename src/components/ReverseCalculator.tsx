import { useState, useMemo, useRef } from "react";
import { ArrowLeftRight } from "lucide-react";
import {
  PPI_OPTIONS,
  VIEWING_PRESETS,
  getPPIDescription,
  getBillboardPPIDescription,
  getRequiredPixels,
  getAspectRatioString,
  formatPixels,
  formatLength,
  toggleButtonClass,
  REVERSE_DEFAULT_WIDTH_IN,
  REVERSE_DEFAULT_HEIGHT_IN,
  REVERSE_DEFAULT_DPI,
  REVERSE_DEFAULT_FEET_DPI,
} from "../lib/calculator";

type Unit = "in" | "ft";

const inputClass =
  "w-[80px] sm:w-[90px] rounded-r-lg border border-l-0 border-white/8 bg-app-card px-3 py-[7px] text-center font-mono text-sm font-medium text-zinc-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-white/15 focus:ring-1 focus:ring-white/8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";

const affixClass =
  "flex items-center justify-center rounded-l-lg border border-r-0 border-white/8 bg-app-card px-2 py-[7px] text-sm font-medium text-zinc-500";

export default function ReverseCalculator() {
  const [unit, setUnit] = useState<Unit>("in");
  const [widthStr, setWidthStr] = useState(String(REVERSE_DEFAULT_WIDTH_IN));
  const [heightStr, setHeightStr] = useState(String(REVERSE_DEFAULT_HEIGHT_IN));
  const [dpiStr, setDpiStr] = useState(String(REVERSE_DEFAULT_DPI));

  // Full-precision inches kept solely so unit toggles round-trip losslessly
  // (e.g. 40" → 3.3 ft → 40", not 39.6"); calculations use the displayed values.
  const canonInchW = useRef(REVERSE_DEFAULT_WIDTH_IN);
  const canonInchH = useRef(REVERSE_DEFAULT_HEIGHT_IN);

  const dpi = parseInt(dpiStr) || 0;
  const widthVal = parseFloat(widthStr) || 0;
  const heightVal = parseFloat(heightStr) || 0;

  const isFeet = unit === "ft";
  const unitMark = isFeet ? " ft" : '"';

  // Compute from the canonical full-precision inches, never the rounded display
  // value. Feet are shown to 3 dp, which is still lossy for fractional inches at
  // high DPI (e.g. 8.5" → 0.708 ft would under-report by 1px), so the math must
  // not go through the displayed value. The refs are kept exact on every valid
  // edit and zeroed on invalid input, so results stay precise and collapse to
  // '—' when a field is empty or negative.
  const { w, h, megapixels, aspect } = useMemo(() => {
    const wi = canonInchW.current;
    const hi = canonInchH.current;
    const { w, h, megapixels } = getRequiredPixels(wi, hi, dpi);
    return { w, h, megapixels, aspect: getAspectRatioString(wi, hi) };
    // widthStr/heightStr/unit gate recomputation; the refs hold the precise size.
  }, [widthStr, heightStr, unit, dpi]);

  const hasResult = w > 0 && h > 0;

  // Keeps the displayed string and the canonical inches ref in sync on edit.
  // Invalid/empty/negative input zeroes the ref so the result collapses to '—'
  // instead of showing the last valid value.
  const editDim = (
    value: string,
    setStr: (v: string) => void,
    canon: React.MutableRefObject<number>,
  ) => {
    setStr(value);
    const n = parseFloat(value);
    canon.current = !isNaN(n) && n >= 0 ? (isFeet ? n * 12 : n) : 0;
  };

  const handleSwap = () => {
    setWidthStr(heightStr);
    setHeightStr(widthStr);
    const t = canonInchW.current;
    canonInchW.current = canonInchH.current;
    canonInchH.current = t;
  };

  const handleUnitChange = (next: Unit) => {
    if (next === unit) return;
    // Re-derive each display string from the precise inches we've kept, keeping
    // enough feet precision that the converted value still drives the same math.
    const nextIsFeet = next === "ft";
    const toDisplay = (inches: number) =>
      String(formatLength(nextIsFeet ? inches / 12 : inches, nextIsFeet));
    setWidthStr(toDisplay(canonInchW.current));
    setHeightStr(toDisplay(canonInchH.current));
    setDpiStr(String(next === "ft" ? REVERSE_DEFAULT_FEET_DPI : REVERSE_DEFAULT_DPI));
    setUnit(next);
  };

  const handleInchBlur = (
    value: string,
    setStr: (v: string) => void,
    canon: React.MutableRefObject<number>,
  ) => {
    const n = parseFloat(value);
    if (isNaN(n) || n < 0) {
      setStr("0");
      canon.current = 0;
      return;
    }
    setStr(String(formatLength(n, isFeet)));
    canon.current = isFeet ? n * 12 : n;
  };

  const handleDpiBlur = (value: string) => {
    const n = parseInt(value);
    setDpiStr(isNaN(n) || n < 0 ? "0" : String(n));
  };

  return (
    <>
      {/* Print dimensions (inches) */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/6 bg-app-card-surface px-5 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:flex-row sm:items-center sm:gap-4">
        <span className="whitespace-nowrap text-[13px] font-medium tracking-wide uppercase text-zinc-500">
          Print Size
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className={affixClass} aria-hidden="true">
              W
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              aria-label={`Print width in ${isFeet ? "feet" : "inches"}`}
              value={widthStr}
              onChange={(e) => editDim(e.target.value, setWidthStr, canonInchW)}
              onBlur={(e) => handleInchBlur(e.target.value, setWidthStr, canonInchW)}
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-app-card text-zinc-500 transition-colors hover:border-white/15 hover:bg-app-hover hover:text-zinc-300"
            title="Swap dimensions"
            aria-label="Swap width and height"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <div className="flex items-center">
            <span className={affixClass} aria-hidden="true">
              H
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              aria-label={`Print height in ${isFeet ? "feet" : "inches"}`}
              value={heightStr}
              onChange={(e) => editDim(e.target.value, setHeightStr, canonInchH)}
              onBlur={(e) => handleInchBlur(e.target.value, setHeightStr, canonInchH)}
              className={inputClass}
            />
          </div>
          <div className="ml-1 flex items-center gap-1.5">
            {(["in", "ft"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => handleUnitChange(u)}
                className={`cursor-pointer rounded-lg px-3 py-[7px] text-sm font-medium transition-all duration-200 ${toggleButtonClass(unit === u)}`}
              >
                {u === "in" ? "inches" : "feet"}
              </button>
            ))}
          </div>
        </div>
        <span className="sm:flex-1" />
        {aspect && (
          <span className="hidden whitespace-nowrap font-mono text-xs text-white sm:inline sm:text-sm">
            {aspect}
          </span>
        )}
      </div>

      {/* Target DPI */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/6 bg-app-card-surface px-5 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
        <span className="whitespace-nowrap text-[13px] font-medium tracking-wide uppercase text-zinc-500">
          Target DPI
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className={affixClass} aria-hidden="true">
              DPI
            </span>
            <input
              type="number"
              inputMode="numeric"
              aria-label="Target DPI"
              value={dpiStr}
              onChange={(e) => setDpiStr(e.target.value)}
              onBlur={(e) => handleDpiBlur(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-1.5">
            {isFeet
              ? VIEWING_PRESETS.map((preset) => (
                  <button
                    key={preset.ppi}
                    onClick={() => setDpiStr(String(preset.ppi))}
                    title={preset.description}
                    className={`cursor-pointer rounded-lg px-3 py-[7px] text-sm font-medium transition-all duration-200 ${toggleButtonClass(dpi === preset.ppi)}`}
                  >
                    {preset.label}{" "}
                    <span className="font-mono text-zinc-500">{preset.ppi}</span>
                  </button>
                ))
              : PPI_OPTIONS.map((val) => (
                  <button
                    key={val}
                    onClick={() => setDpiStr(String(val))}
                    className={`cursor-pointer rounded-lg px-3 py-[7px] font-mono text-sm font-medium transition-all duration-200 ${toggleButtonClass(dpi === val)}`}
                  >
                    {val}
                  </button>
                ))}
          </div>
        </div>
        <span className="hidden sm:block sm:flex-1" />
        <span className="text-sm text-white">
          {isFeet ? getBillboardPPIDescription(dpi) : getPPIDescription(dpi)}
        </span>
      </div>

      <p className="mb-7 mt-[-4px] text-sm leading-relaxed text-zinc-500">
        Your file needs at least this many pixels to print{" "}
        {formatLength(widthVal, isFeet)}×{formatLength(heightVal, isFeet)}
        {unitMark} at {dpi} DPI — fewer pixels means the print falls below the
        target resolution.
      </p>

      {/* Result */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="min-w-[220px] flex-[2] rounded-2xl border border-white/6 bg-app-card-surface px-5 py-5 shadow-[inset_0_1px_0_0_rgba(56,189,248,0.18)]">
          <div className="mb-1 text-[11px] uppercase tracking-[1px] text-zinc-600">
            Required pixels
          </div>
          <div className="font-mono text-2xl font-bold text-app-highlight sm:text-3xl">
            {hasResult ? `${formatPixels(w)} × ${formatPixels(h)}` : "—"}
            {hasResult && (
              <span className="ml-1.5 text-sm font-normal text-zinc-600">
                px
              </span>
            )}
          </div>
        </div>
        <div className="min-w-[160px] flex-1 rounded-2xl border border-white/6 bg-app-card-surface px-5 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="mb-1 text-[11px] uppercase tracking-[1px] text-zinc-600">
            Total resolution
          </div>
          <div className="font-mono text-2xl font-bold text-zinc-200">
            {hasResult ? megapixels.toFixed(1) : "—"}
            {hasResult && (
              <span className="ml-1 text-sm font-normal text-zinc-600">MP</span>
            )}
          </div>
        </div>
        <div className="min-w-[160px] flex-1 rounded-2xl border border-white/6 bg-app-card-surface px-5 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="mb-1 text-[11px] uppercase tracking-[1px] text-zinc-600">
            Aspect ratio
          </div>
          <div className="font-mono text-2xl font-bold text-zinc-400">
            {aspect ?? "—"}
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5 list-disc pl-5 text-lg leading-relaxed text-zinc-400 text-pretty">
        <li>
          The formula is simply{" "}
          <span className="text-zinc-200">
            pixels = {isFeet ? "feet × 12 × DPI" : "inches × DPI"}
          </span>
          , applied to each side independently.
        </li>
        <li>
          <span className="text-zinc-200">DPI</span> here means pixels per inch
          of the printed output — the actual resolution sent to the printer, not
          any DPI tag stored in the file.
        </li>
        {isFeet ? (
          <li>
            Billboard targets:{" "}
            <span className="text-zinc-200">100</span> for indoor viewing up
            close (trade shows), <span className="text-zinc-200">35</span> at
            street level, and <span className="text-zinc-200">20</span> for
            highway billboards seen from far away.
          </li>
        ) : (
          <li>
            Common targets:{" "}
            <span className="text-zinc-200">300</span> for prints viewed up
            close, <span className="text-zinc-200">200</span> at arm's length,
            and <span className="text-zinc-200">150</span> for larger prints
            seen across a room.
          </li>
        )}
      </ul>
    </>
  );
}
