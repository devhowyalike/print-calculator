export const DEFAULT_WIDTH = 5592;
export const DEFAULT_HEIGHT = 4096;

export const BILLBOARD_SIZES = [
  { name: '6x12 ft', w: 72, h: 144 },
  { name: '8x24 ft', w: 96, h: 288 },
  { name: '12x25 ft', w: 144, h: 300 },
  { name: '14x48 ft', w: 168, h: 576 },
  { name: '20x40 ft', w: 240, h: 480 },
];

export const VIEWING_PRESETS = [
  { label: 'Indoor', distanceFt: 5, ppi: 100, description: 'Trade Show' },
  { label: 'Street', distanceFt: 30, ppi: 35, description: 'Storefront' },
  { label: 'Highway', distanceFt: 500, ppi: 20, description: 'Billboard' },
] as const;

export type ViewingLabel = typeof VIEWING_PRESETS[number]['label'];

export const COMMON_SIZES = [
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

export type Status = "perfect" | "acceptable" | "stretch" | "poor";

export const STATUS_CONFIG = {
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

export function getStatus(
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

export function getEffectiveDPI(
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
export function getViewingPPI(size: { w: number; h: number }) {
  const diagonal = Math.sqrt(size.w ** 2 + size.h ** 2);
  const viewingDistance = diagonal * 1.5;
  return Math.round(3438 / viewingDistance);
}

/**
 * Minimum PPI needed for a given viewing distance in feet.
 * Uses the same 1-arcminute visual acuity formula.
 */
export function getViewingPPIFromDistance(distanceFt: number): number {
  const distanceInches = distanceFt * 12;
  return 3438 / distanceInches;
}
