import { useState, useMemo } from "react";
import { ArrowLeftRight } from "lucide-react";
import {
  PPI_OPTIONS,
  getPPIDescription,
  getRequiredPixels,
  getAspectRatioString,
  formatPixels,
  formatDim,
  toggleButtonClass,
  REVERSE_DEFAULT_WIDTH_IN,
  REVERSE_DEFAULT_HEIGHT_IN,
  REVERSE_DEFAULT_DPI,
} from "../lib/calculator";

const inputClass =
  "w-[80px] sm:w-[90px] rounded-r-lg border border-l-0 border-white/8 bg-app-card px-3 py-[7px] text-center font-mono text-sm font-medium text-zinc-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-white/15 focus:ring-1 focus:ring-white/8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";

const affixClass =
  "flex items-center justify-center rounded-l-lg border border-r-0 border-white/8 bg-app-card px-2 py-[7px] text-sm font-medium text-zinc-500";

export default function ReverseCalculator() {
  const [widthInStr, setWidthInStr] = useState(String(REVERSE_DEFAULT_WIDTH_IN));
  const [heightInStr, setHeightInStr] = useState(
    String(REVERSE_DEFAULT_HEIGHT_IN),
  );
  const [dpiStr, setDpiStr] = useState(String(REVERSE_DEFAULT_DPI));

  const widthIn = parseFloat(widthInStr) || 0;
  const heightIn = parseFloat(heightInStr) || 0;
  const dpi = parseInt(dpiStr) || 0;

  const { w, h, megapixels, aspect } = useMemo(() => {
    const { w, h, megapixels } = getRequiredPixels(widthIn, heightIn, dpi);
    return { w, h, megapixels, aspect: getAspectRatioString(widthIn, heightIn) };
  }, [widthIn, heightIn, dpi]);

  const hasResult = w > 0 && h > 0;

  const handleSwap = () => {
    setWidthInStr(heightInStr);
    setHeightInStr(widthInStr);
  };

  const handleInchBlur = (value: string, setter: (v: string) => void) => {
    const n = parseFloat(value);
    setter(isNaN(n) || n < 0 ? "0" : String(formatDim(n)));
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
            <span className={affixClass}>W</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={widthInStr}
              onChange={(e) => setWidthInStr(e.target.value)}
              onBlur={(e) => handleInchBlur(e.target.value, setWidthInStr)}
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
            <span className={affixClass}>H</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={heightInStr}
              onChange={(e) => setHeightInStr(e.target.value)}
              onBlur={(e) => handleInchBlur(e.target.value, setHeightInStr)}
              className={inputClass}
            />
          </div>
          <span className="text-xs text-white">inches</span>
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
            <span className={affixClass}>DPI</span>
            <input
              type="number"
              inputMode="numeric"
              value={dpiStr}
              onChange={(e) => setDpiStr(e.target.value)}
              onBlur={(e) => handleDpiBlur(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-1.5">
            {PPI_OPTIONS.map((val) => (
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
        <span className="text-sm text-white">{getPPIDescription(dpi)}</span>
      </div>

      <p className="mb-7 mt-[-4px] text-sm leading-relaxed text-zinc-500">
        Your file needs at least this many pixels to print {formatDim(widthIn)}×
        {formatDim(heightIn)}" at {dpi} DPI — fewer pixels means the print falls
        below the target resolution.
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
          <span className="text-zinc-200">pixels = inches × DPI</span>, applied to
          each side independently.
        </li>
        <li>
          <span className="text-zinc-200">DPI</span> here means pixels per inch
          of the printed output — the actual resolution sent to the printer, not
          any DPI tag stored in the file.
        </li>
        <li>
          Common targets:{" "}
          <span className="text-zinc-200">300</span> for prints viewed up close,{" "}
          <span className="text-zinc-200">200</span> at arm's length, and{" "}
          <span className="text-zinc-200">150</span> for larger prints seen
          across a room.
        </li>
      </ul>
    </>
  );
}
