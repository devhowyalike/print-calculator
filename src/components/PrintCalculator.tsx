import { useState, useMemo } from "react";
import type { Status } from "../lib/calculator";
import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  COMMON_SIZES,
  STATUS_CONFIG,
  getStatus,
  getEffectiveDPI,
  getViewingPPI,
} from "../lib/calculator";

export default function PrintCalculator() {
  const [dpi, setDpi] = useState(150);
  const [pixelW, setPixelW] = useState(DEFAULT_WIDTH);
  const [pixelH, setPixelH] = useState(DEFAULT_HEIGHT);

  const data = useMemo(() => {
    const w = pixelW || 0;
    const h = pixelH || 0;
    return COMMON_SIZES.map((size) => {
      const effectiveDPI = Math.round(getEffectiveDPI(size, w, h));
      const viewingPPI = getViewingPPI(size);
      const status = getStatus(size, dpi, w, h);
      const fineForDistance = effectiveDPI < dpi && effectiveDPI >= viewingPPI;
      return { ...size, status, effectiveDPI, viewingPPI, fineForDistance };
    });
  }, [dpi, pixelW, pixelH]);

  const excellent = data.filter((d) => d.status === "perfect").length;
  const lastExcellent = [...data].reverse().find((d) => d.status === "perfect");

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
          print sizes their digital images can support at a given quality
          level.
        </h2>
        <h3 className="mt-6 text-xl font-semibold leading-relaxed text-white">
          Source file dimensions
        </h3>
      </div>

      {/* Dimension Inputs */}
      <div className="mb-3 flex items-center gap-4 rounded-xl border border-zinc-800 bg-[#131316] px-[18px] py-3.5">
        <span className="whitespace-nowrap text-[13px] font-medium text-zinc-500">
          Pixels
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={pixelW}
            onChange={(e) =>
              setPixelW(Math.max(0, parseInt(e.target.value) || 0))
            }
            className="w-[90px] rounded-lg border border-zinc-700 bg-[#1c1c21] px-3 py-[7px] text-center font-mono text-sm font-medium text-zinc-200 outline-none focus:border-zinc-500"
          />
          <span className="text-base font-light text-zinc-700">x</span>
          <input
            type="number"
            value={pixelH}
            onChange={(e) =>
              setPixelH(Math.max(0, parseInt(e.target.value) || 0))
            }
            className="w-[90px] rounded-lg border border-zinc-700 bg-[#1c1c21] px-3 py-[7px] text-center font-mono text-sm font-medium text-zinc-200 outline-none focus:border-zinc-500"
          />
          <span className="text-xs text-zinc-700">px</span>
        </div>
        <div className="flex-1" />
        <span className="font-mono text-sm text-white">
          {((pixelW * pixelH) / 1000000).toFixed(1)} MP
        </span>
      </div>

      {/* PPI Selector */}
      <div className="mb-7 flex items-center gap-4 rounded-xl border border-zinc-800 bg-[#131316] px-[18px] py-3.5">
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
        <div className="flex-1" />
        <span className="text-sm text-white">
          {dpi <= 150
            ? "Standard \u2014 good across the room"
            : dpi <= 200
              ? "High quality \u2014 good at arm's length"
              : "Maximum \u2014 good handheld"}
        </span>
      </div>

      <p className="mb-7 mt-[-16px] text-sm leading-relaxed text-zinc-500">
        This calculator uses pixel dimensions only (PPI) — the DPI metadata
        embedded in your image file doesn't affect the results.{" "}
        <a
          href="#ppi-vs-dpi"
          className="text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition-colors hover:text-zinc-200"
        >
          Learn more ↓
        </a>
      </p>

      {/* Summary Cards */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="min-w-[160px] flex-1 rounded-[10px] border border-[#1c1c21] bg-[#131316] px-[18px] py-3.5">
          <div className="mb-1 text-[11px] uppercase tracking-[1px] text-zinc-600">
            Printable sizes
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
            {lastExcellent ? lastExcellent.name : "—"}
          </div>
        </div>
        <div className="min-w-[160px] flex-1 rounded-[10px] border border-[#1c1c21] bg-[#131316] px-[18px] py-3.5">
          <div className="mb-1 text-[11px] uppercase tracking-[1px] text-zinc-600">
            Max PPI at largest
          </div>
          <div className="font-mono text-2xl font-bold text-zinc-400">
            {lastExcellent ? lastExcellent.effectiveDPI : "—"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[14px] border border-[#1c1c21] bg-[#131316]">
        <div className="grid grid-cols-[90px_1fr_80px_80px_80px] border-b border-[#1c1c21] px-5 py-3 text-[11px] font-semibold uppercase tracking-[1px] text-zinc-600">
          <div>Size</div>
          <div>Coverage</div>
          <div className="text-right">Your PPI</div>
          <div className="text-right">Min PPI</div>
          <div className="text-right">Quality</div>
        </div>

        {data.map((item, i) => {
          const sc = STATUS_CONFIG[item.status];
          const coveragePercent = Math.min(
            (item.effectiveDPI / dpi) * 100,
            100,
          );
          return (
            <div
              key={item.name}
              className="grid grid-cols-[90px_1fr_80px_80px_80px] items-center px-5 py-[11px] transition-colors duration-300"
              style={{
                background: sc.bg,
                borderBottom:
                  i < data.length - 1 ? "1px solid #1a1a1f" : "none",
              }}
            >
              <div className="font-mono text-sm font-semibold text-zinc-200">
                {item.name}
              </div>
              <div className="pr-5">
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
                className="text-right font-mono text-[13px] font-medium"
                style={{
                  color:
                    item.effectiveDPI >= item.viewingPPI
                      ? "#38bdf8"
                      : "#71717a",
                }}
              >
                {item.viewingPPI}
              </div>
              <div
                className="flex items-center justify-end gap-[5px] text-right text-xs font-medium"
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
                ? `≥ ${dpi} PPI (meets target)`
                : key === "acceptable"
                  ? `≥ ${Math.round(dpi * 0.85)} PPI (near target)`
                  : key === "stretch"
                    ? `≥ ${Math.round(dpi * 0.6)} PPI (needs more pixels)`
                    : `< ${Math.round(dpi * 0.6)} PPI (not enough pixels)`}
            </span>
          </div>
        ))}
      </div>

      <ul className="mt-6 space-y-2.5 list-disc pl-5 text-lg leading-relaxed text-zinc-400">
        <li>Both landscape and portrait orientations are considered.</li>
        <li>
          <span className="text-zinc-200">"Your PPI"</span> shows the
          effective resolution your {pixelW}x{pixelH} file achieves at each
          print size.
        </li>
        <li>
          Quality ratings compare this against your{" "}
          <span className="text-zinc-200">{dpi} PPI target</span> — they
          reflect whether your image has enough pixels, not whether the print
          will look bad.
        </li>
        <li>
          <span className="text-blue-400">Min PPI</span> is the lowest
          resolution the human eye can distinguish at a typical viewing
          distance for that size (1.5x the diagonal).
        </li>
        <li>
          If your PPI exceeds the min, the print will look sharp in practice —
          even if it's below your target.
        </li>
      </ul>
    </>
  );
}
