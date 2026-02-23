import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/")({ component: PrintSizeChart });

const DEFAULT_WIDTH = 5592;
const DEFAULT_HEIGHT = 4096;

const COMMON_SIZES = [
  { name: '4×6"', w: 4, h: 6 },
  { name: '5×7"', w: 5, h: 7 },
  { name: '8×10"', w: 8, h: 10 },
  { name: '8.5×11"', w: 8.5, h: 11 },
  { name: '11×14"', w: 11, h: 14 },
  { name: '12×16"', w: 12, h: 16 },
  { name: '12×18"', w: 12, h: 18 },
  { name: '16×20"', w: 16, h: 20 },
  { name: '16×24"', w: 16, h: 24 },
  { name: '18×24"', w: 18, h: 24 },
  { name: '20×24"', w: 20, h: 24 },
  { name: '20×30"', w: 20, h: 30 },
  { name: '24×36"', w: 24, h: 36 },
  { name: '30×40"', w: 30, h: 40 },
  { name: '36×48"', w: 36, h: 48 },
];

type Status = "perfect" | "acceptable" | "stretch" | "poor";

function getStatus(
  size: { w: number; h: number },
  dpi: number,
  pw: number,
  ph: number,
): Status {
  const neededW = size.w * dpi;
  const neededH = size.h * dpi;
  const fitLandscape = pw >= neededW && ph >= neededH;
  const fitPortrait = pw >= neededH && ph >= neededW;

  if (fitLandscape || fitPortrait) return "perfect";

  const ratioL = Math.min(pw / neededW, ph / neededH);
  const ratioP = Math.min(pw / neededH, ph / neededW);
  const bestRatio = Math.max(ratioL, ratioP);

  if (bestRatio >= 0.85) return "acceptable";
  if (bestRatio >= 0.6) return "stretch";
  return "poor";
}

function getEffectiveDPI(
  size: { w: number; h: number },
  pw: number,
  ph: number,
) {
  const dpiLandW = pw / size.w;
  const dpiLandH = ph / size.h;
  const dpiPortW = pw / size.h;
  const dpiPortH = ph / size.w;
  const landscape = Math.min(dpiLandW, dpiLandH);
  const portrait = Math.min(dpiPortW, dpiPortH);
  return Math.max(landscape, portrait);
}

/**
 * Minimum PPI needed based on typical viewing distance for a print size.
 * Uses 1-arcminute visual acuity: threshold ≈ 3438 / distance_inches.
 * Viewing distance heuristic: 1.5× the print diagonal.
 */
function getViewingPPI(size: { w: number; h: number }) {
  const diagonal = Math.sqrt(size.w ** 2 + size.h ** 2);
  const viewingDistance = diagonal * 1.5;
  return Math.round(3438 / viewingDistance);
}

const STATUS_CONFIG = {
  perfect: {
    label: "Excellent",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    icon: "✓",
  },
  acceptable: {
    label: "Good",
    color: "#eab308",
    bg: "rgba(234,179,8,0.06)",
    icon: "~",
  },
  stretch: {
    label: "Marginal",
    color: "#f97316",
    bg: "rgba(249,115,22,0.06)",
    icon: "!",
  },
  poor: {
    label: "Too Low",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.06)",
    icon: "✗",
  },
} as const;

function PrintSizeChart() {
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
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-200 px-6 py-10">
      <div className="mx-auto max-w-[780px]">
        {/* Header */}
        <div className="mb-5">
          <div className="mb-1.5 flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="font-mono text-xs uppercase tracking-[1.5px] text-zinc-500">
              Print Calculator
            </span>
          </div>
          <h1 className="mb-1.5 mt-0 bg-linear-to-br from-zinc-200 to-zinc-400 bg-clip-text text-[28px] font-bold text-transparent">
            What Can You Print?
          </h1>
          <p className="mt-2 m-0 text-xl leading-relaxed text-zinc-400">
            This calculator uses pixel dimensions only (PPI) — the DPI metadata
            embedded in your image file doesn't affect the results.{" "}
            <a
              href="#ppi-vs-dpi"
              className="text-zinc-300 underline decoration-zinc-600 underline-offset-2 transition-colors hover:text-zinc-100"
            >
              Learn more ↓
            </a>
          </p>
          <h2 className="mt-6 text-xl font-semibold leading-relaxed text-white">
            Source file dimensions
          </h2>
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
            <span className="text-base font-light text-zinc-700">×</span>
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
              ? "Standard \u2014 good at arm\u2019s length+"
              : dpi <= 200
                ? "High quality \u2014 close viewing"
                : "Maximum \u2014 gallery / handheld"}
          </span>
        </div>

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
          {/* Table header */}
          <div className="grid grid-cols-[90px_1fr_80px_80px_80px] border-b border-[#1c1c21] px-5 py-3 text-[11px] font-semibold uppercase tracking-[1px] text-zinc-600">
            <div>Size</div>
            <div>Coverage</div>
            <div className="text-right">Your PPI</div>
            <div className="text-right">Min PPI</div>
            <div className="text-right">Quality</div>
          </div>

          {/* Table rows */}
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
            effective resolution your {pixelW}×{pixelH} file achieves at each
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
            distance for that size (1.5× the diagonal).
          </li>
          <li>
            If your PPI exceeds the min, the print will look sharp in practice —
            even if it's below your target.
          </li>
        </ul>

        {/* PPI vs DPI Explainer */}
        <div
          id="ppi-vs-dpi"
          className="mt-12 scroll-mt-6 rounded-[14px] border border-[#1c1c21] bg-[#131316] px-6 py-6"
        >
          <div className="mb-4 flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-zinc-500 shadow-[0_0_6px_rgba(161,161,170,0.3)]" />
            <span className="font-mono text-xs uppercase tracking-[1.5px] text-zinc-500">
              Reference
            </span>
          </div>
          <h2 className="mb-4 bg-linear-to-br from-zinc-200 to-zinc-400 bg-clip-text text-xl font-bold text-transparent">
            PPI vs DPI — What's the Difference?
          </h2>
          <p className="mb-5 text-lg leading-relaxed text-zinc-400">
            The terms are often used interchangeably, but they describe two
            different stages of the image pipeline.
          </p>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[10px] border border-[#1c1c21] bg-[#0e0e10] px-5 py-4">
              <div className="mb-2 text-md font-semibold uppercase tracking-[1px] text-zinc-500">
                PPI — Pixels Per Inch
              </div>
              <p className="m-0 text-sm leading-relaxed text-zinc-400">
                Describes the{" "}
                <span className="text-zinc-200">digital file</span>. It's how
                many pixels exist per inch of the image at a given print size.
                Higher PPI means more detail is available for the printer to
                work with. This calculator computes the effective PPI of your
                file at each size.
              </p>
            </div>
            <div className="rounded-[10px] border border-[#1c1c21] bg-[#0e0e10] px-5 py-4">
              <div className="mb-2 text-md font-semibold uppercase tracking-[1px] text-zinc-500">
                DPI — Dots Per Inch
              </div>
              <p className="m-0 text-sm leading-relaxed text-zinc-400">
                Describes the{" "}
                <span className="text-zinc-200">physical printer</span>. It's
                how many tiny ink dots the device lays down per inch of paper. A
                printer rated at 1440 DPI can place 1440 droplets per inch — far
                more than the 300 PPI typically needed from a source file.
              </p>
            </div>
          </div>

          <div className="rounded-[10px] border border-[#1c1c21] bg-[#0e0e10] px-5 py-4">
            <div className="mb-2 text-md font-semibold uppercase tracking-[1px] text-zinc-500">
              Why it matters
            </div>
            <p className="m-0 text-sm leading-relaxed text-zinc-400">
              A 300 PPI source file is the gold standard for close-up viewing
              (books, gallery prints). For wall art viewed from a few feet away,
              150–200 PPI is usually indistinguishable. The printer's own DPI is
              always much higher — it uses multiple ink dots to reproduce a
              single pixel of color, which is why a 1440 DPI printer still
              benefits from a 300 PPI file. In short:{" "}
              <span className="text-zinc-200">
                PPI is what you control, DPI is what the printer controls.
              </span>
            </p>
          </div>
        </div>

        {/* Sources */}
        <div className="mt-12 rounded-[14px] border border-[#1c1c21] bg-[#131316] px-6 py-6">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-zinc-500 shadow-[0_0_6px_rgba(161,161,170,0.3)]" />
            <span className="font-mono text-xs uppercase tracking-[1.5px] text-zinc-500">
              Sources
            </span>
          </div>
          <ul className="m-0 list-none space-y-2 p-0">
            <li>
              <a
                href="https://www.youtube.com/watch?v=6OxoqkZwmmk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition-colors hover:text-zinc-200"
              >
                https://www.youtube.com/watch?v=6OxoqkZwmmk
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
