import { useState, useMemo } from "react";
import type { Status } from "../lib/calculator";
import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  BILLBOARD_DEFAULT_WIDTH,
  BILLBOARD_DEFAULT_HEIGHT,
  COMMON_SIZES,
  BILLBOARD_SIZES,
  VIEWING_PRESETS,
  STATUS_CONFIG,
  getStatus,
  getEffectiveDPI,
  getDisplayDimensions,
  getViewingPPI,
  getViewingPPIFromDistance,
} from "../lib/calculator";

type Mode = "print" | "billboard";

export default function PrintCalculator() {
  const [mode, setMode] = useState<Mode>("print");
  const [dpi, setDpi] = useState(150);
  const [viewingDistanceFt, setViewingDistanceFt] = useState(5);
  const [pixelWStr, setPixelWStr] = useState(String(DEFAULT_WIDTH));
  const [pixelHStr, setPixelHStr] = useState(String(DEFAULT_HEIGHT));

  const pixelW = parseInt(pixelWStr) || 0;
  const pixelH = parseInt(pixelHStr) || 0;

  const sizes = mode === "print" ? COMMON_SIZES : BILLBOARD_SIZES;

  const currentPreset = VIEWING_PRESETS.find(
    (p) => p.distanceFt === viewingDistanceFt,
  );
  const currentPresetPPI =
    currentPreset?.ppi ??
    Math.ceil(getViewingPPIFromDistance(viewingDistanceFt));

  const data = useMemo(() => {
    const w = pixelW;
    const h = pixelH;
    return sizes.map((size) => {
      const display = getDisplayDimensions(size, w, h);
      const effectiveDPI = Math.round(getEffectiveDPI(size, w, h));
      const viewingPPI =
        mode === "print" ? getViewingPPI(size) : currentPresetPPI;
      const targetDpi = mode === "print" ? dpi : currentPresetPPI;
      const status = getStatus(size, targetDpi, w, h);
      const fineForDistance =
        effectiveDPI < targetDpi && effectiveDPI >= viewingPPI;
      const displayName =
        mode === "print"
          ? `${display.w % 1 ? display.w : Math.round(display.w)}×${display.h % 1 ? display.h : Math.round(display.h)}"`
          : `${Math.round(display.w / 12)}×${Math.round(display.h / 12)} ft`;
      return {
        ...size,
        displayName,
        status,
        effectiveDPI,
        viewingPPI,
        fineForDistance,
        targetDpi,
      };
    });
  }, [mode, dpi, currentPresetPPI, pixelW, pixelH, sizes]);

  const excellent = data.filter((d) => d.status === "perfect").length;
  const lastExcellent = [...data].reverse().find((d) => d.status === "perfect");
  const activeDpi = mode === "print" ? dpi : currentPresetPPI;

  return (
    <>
      {/* Header */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center gap-2.5">
          <span className="text-sm">🖨️</span>
          <h1 className="font-mono text-3xl uppercase tracking-[1.5px] text-zinc-500">
            Pixel to Print Calculator
          </h1>
        </div>

        <h2 className="mt-1 mb-4 text-xl font-normal text-white">
          A tool for photographers, designers and artists to determine which
          print sizes their digital images can support at a given quality level.
        </h2>

        {/* Mode toggle */}
        <div className="mt-5 mb-1 flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#131316] p-1 w-fit">
          {(["print", "billboard"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === "print") {
                  setPixelWStr(String(DEFAULT_WIDTH));
                  setPixelHStr(String(DEFAULT_HEIGHT));
                } else {
                  setPixelWStr(String(BILLBOARD_DEFAULT_WIDTH));
                  setPixelHStr(String(BILLBOARD_DEFAULT_HEIGHT));
                }
              }}
              className={`cursor-pointer rounded-lg px-4 py-[7px] text-sm font-medium transition-all duration-200 ${
                mode === m
                  ? "border border-zinc-700 bg-[#1c1c21] text-zinc-200"
                  : "border border-transparent bg-transparent text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {m === "print" ? "Standard Print" : "Billboard / Large Format"}
            </button>
          ))}
        </div>

        <h3 className="mt-6 text-xl font-semibold leading-relaxed text-white">
          Source file dimensions
        </h3>
      </div>

      {/* Dimension Inputs */}
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#131316] px-[18px] py-3.5">
        <span className="whitespace-nowrap text-[13px] font-medium text-zinc-500">
          Pixels
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={pixelWStr}
            onChange={(e) => setPixelWStr(e.target.value)}
            onBlur={(e) => {
              const n = parseInt(e.target.value);
              setPixelWStr(String(isNaN(n) || n < 0 ? 0 : n));
            }}
            className="w-[80px] sm:w-[90px] rounded-lg border border-zinc-700 bg-[#1c1c21] px-3 py-[7px] text-center font-mono text-sm font-medium text-zinc-200 outline-none focus:border-zinc-500"
          />
          <span className="text-base font-light text-zinc-700">x</span>
          <input
            type="number"
            value={pixelHStr}
            onChange={(e) => setPixelHStr(e.target.value)}
            onBlur={(e) => {
              const n = parseInt(e.target.value);
              setPixelHStr(String(isNaN(n) || n < 0 ? 0 : n));
            }}
            className="w-[80px] sm:w-[90px] rounded-lg border border-zinc-700 bg-[#1c1c21] px-3 py-[7px] text-center font-mono text-sm font-medium text-zinc-200 outline-none focus:border-zinc-500"
          />
          <span className="text-xs text-zinc-700">px</span>
        </div>
        <div className="flex-1" />
        <span className="font-mono text-xs sm:text-sm text-white whitespace-nowrap">
          {((pixelW * pixelH) / 1000000).toFixed(1)} MP
        </span>
      </div>

      {/* PPI Selector / Viewing Distance */}
      <div className="mb-7 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-zinc-800 bg-[#131316] px-[18px] py-3.5">
        {mode === "print" ? (
          <>
            <span className="whitespace-nowrap text-[13px] font-medium text-zinc-500">
              Target PPI
            </span>
            <div className="flex gap-1.5">
              {([150, 200, 300] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setDpi(val)}
                  className={`cursor-pointer rounded-lg px-[18px] py-[7px] font-mono text-sm font-medium transition-all duration-200 ${
                    dpi === val
                      ? "border border-zinc-700 bg-[#1c1c21] text-zinc-200"
                      : "border border-transparent bg-transparent text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <span className="hidden sm:block flex-1" />
            <span className="text-sm text-white">
              {dpi <= 150
                ? "Standard \u2014 good across the room"
                : dpi <= 200
                  ? "High quality \u2014 good at arm's length"
                  : "Maximum \u2014 good handheld"}
            </span>
          </>
        ) : (
          <>
            <span className="whitespace-nowrap text-[13px] font-medium text-zinc-500">
              Viewing Distance
            </span>
            <div className="flex gap-1.5">
              {VIEWING_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setViewingDistanceFt(preset.distanceFt)}
                  className={`cursor-pointer rounded-lg px-[18px] py-[7px] text-sm font-medium transition-all duration-200 ${
                    viewingDistanceFt === preset.distanceFt
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
              {currentPreset?.description ?? ""} (~{viewingDistanceFt} ft)
              {" \u2014 "}
              <span className="font-mono text-zinc-400">
                {currentPresetPPI} PPI target
              </span>
            </span>
          </>
        )}
      </div>

      <p className="mb-7 mt-[-16px] text-sm leading-relaxed text-zinc-500">
        {mode === "print" ? (
          <>
            This calculator uses pixel dimensions only (PPI) — the DPI metadata
            embedded in your image file doesn't affect the results.{" "}
            <a
              href="#ppi-vs-dpi"
              className="text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition-colors hover:text-zinc-200"
            >
              Learn more ↓
            </a>
          </>
        ) : (
          <>
            Billboard sizes are rated against industry-standard PPI targets for
            the selected viewing context. Quality ratings reflect whether your
            file has enough pixels for sharp output at that distance.
          </>
        )}
      </p>

      {/* Summary Cards */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="min-w-[160px] flex-1 rounded-[10px] border border-[#1c1c21] bg-[#131316] px-[18px] py-3.5">
          <div className="mb-1 text-[11px] uppercase tracking-[1px] text-zinc-600">
            {mode === "print" ? "Printable sizes" : "Usable sizes"}
          </div>
          <div className="text-2xl font-bold text-green-500">
            {excellent}
            <span className="text-sm font-normal text-zinc-600">
              {" "}
              / {data.length}
            </span>
          </div>
        </div>
        <div className="min-w-[160px] flex-1 rounded-[10px] border border-[#1c1c21] bg-[#131316] px-[18px] py-3.5">
          <div className="mb-1 text-[11px] uppercase tracking-[1px] text-zinc-600">
            Largest excellent
          </div>
          <div className="text-2xl font-bold text-zinc-200">
            {lastExcellent ? lastExcellent.displayName : "—"}
          </div>
        </div>
        <div className="min-w-[160px] flex-1 rounded-[10px] border border-[#1c1c21] bg-[#131316] px-[18px] py-3.5">
          <div className="mb-1 text-[11px] uppercase tracking-[1px] text-zinc-600">
            PPI at largest usable size
          </div>
          <div className="font-mono text-2xl font-bold text-zinc-400">
            {lastExcellent ? lastExcellent.effectiveDPI : "—"}
          </div>
        </div>
      </div>

      {/* Table */}
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
                  i < data.length - 1 ? "1px solid #1a1a1f" : "none",
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
              {/* Mobile: show quality icon only */}
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
              {/* Desktop: Min PPI */}
              <div
                className="hidden sm:block text-right font-mono text-[13px] font-medium"
                style={{
                  color:
                    item.effectiveDPI >= item.viewingPPI
                      ? "#38bdf8"
                      : "#71717a",
                }}
              >
                {item.viewingPPI}
              </div>
              {/* Desktop: Quality label */}
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

      {/* Legend */}
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

      <ul className="mt-6 space-y-2.5 list-disc pl-5 text-lg leading-relaxed text-zinc-400 text-pretty">
        <li>Both landscape and portrait orientations are considered.</li>
        <li>
          <span className="text-zinc-200">"Your PPI"</span> shows the effective
          resolution your {pixelW}x{pixelH} file achieves at each{" "}
          {mode === "billboard" ? "billboard" : "print"} size.
        </li>
        {mode === "print" ? (
          <>
            <li>
              Quality ratings compare this against your{" "}
              <span className="text-zinc-200">{dpi} PPI target</span> — they
              reflect whether your image has enough pixels, not whether the
              print will look bad.
            </li>
            <li>
              <span className="text-blue-400">Min PPI</span> is the lowest
              resolution the human eye can distinguish at a typical viewing
              distance for that size (1.5× the diagonal).
            </li>
            <li>
              If your PPI exceeds the min, the print will look sharp in practice
              — even if it's below your target.
            </li>
          </>
        ) : (
          <>
            <li>
              Quality ratings compare your PPI against the{" "}
              <span className="text-zinc-200">{currentPresetPPI} PPI</span>{" "}
              industry standard for{" "}
              <span className="text-zinc-200">
                {currentPreset?.label.toLowerCase() ?? "this"} viewing (~
                {viewingDistanceFt} ft)
              </span>
              . Below this, the image will look soft at that distance.
            </li>
          </>
        )}
      </ul>
    </>
  );
}
