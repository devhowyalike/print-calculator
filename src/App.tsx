import { useState, useMemo } from "react";

const DEFAULT_WIDTH = 5592;
const DEFAULT_HEIGHT = 4096;

const COMMON_SIZES = [
  { name: '4x6"', w: 4, h: 6 },
  { name: '5x7"', w: 5, h: 7 },
  { name: '8x10"', w: 8, h: 10 },
  { name: '8.5x11"', w: 8.5, h: 11 },
  { name: '11x14"', w: 11, h: 14 },
  { name: '12x16"', w: 12, h: 16 },
  { name: '12x18"', w: 12, h: 18 },
  { name: '16x20"', w: 16, h: 20 },
  { name: '16x24"', w: 16, h: 24 },
  { name: '18x24"', w: 18, h: 24 },
  { name: '20x24"', w: 20, h: 24 },
  { name: '20x30"', w: 20, h: 30 },
  { name: '24x36"', w: 24, h: 36 },
  { name: '30x40"', w: 30, h: 40 },
  { name: '36x48"', w: 36, h: 48 },
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
 * Viewing distance heuristic: 1.5x the print diagonal.
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

export default function App() {
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
              ? "Standard \u2014 good at arm\u2019s length+"
              : dpi <= 200
                ? "High quality \u2014 close viewing"
                : "Maximum \u2014 gallery / handheld"}
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

        {/* Resources */}
        <div className="mt-12 rounded-[14px] border border-[#1c1c21] bg-[#131316] px-6 py-6">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-zinc-500 shadow-[0_0_6px_rgba(161,161,170,0.3)]" />
            <span className="font-mono text-xs uppercase tracking-[1.5px] text-zinc-500">
              Resources
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
                "How many pixels per inch do you need to make large prints?" by
                Simon d'Entremont
              </a>
            </li>
          </ul>
        </div>
        {/* Disclaimer */}
        <p className="mt-8 text-center text-lg leading-relaxed text-white">
          <span className="mr-2">⚠️</span>Quality ratings are based on
          perceptual heuristics (viewing distance, visual acuity estimates) and
          are intended as a practical guide, not a definitive standard.
          Calculations may be inaccurate. Results may vary depending on the
          printer, paper, viewing conditions, and individual perception. Use at
          your own risk.
        </p>
        {/* Footer */}
        <div className="mt-6 mb-2 flex items-center justify-center gap-4">
          <span className="font-mono text-xs text-zinc-600">
            Made by Yameen
          </span>
          <span className="text-zinc-800">·</span>
          <a
            href="https://github.com/devhowyalike/print-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-600 transition-colors hover:text-zinc-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="font-mono text-xs">
              devhowyalike/print-calculator
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
