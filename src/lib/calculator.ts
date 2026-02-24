import { ASPECT_RATIOS, type Status } from './calculatorConstants';

export {
  ASPECT_RATIOS,
  BILLBOARD_DEFAULT_HEIGHT,
  BILLBOARD_DEFAULT_WIDTH,
  BILLBOARD_SIZES,
  COMMON_SIZES,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  SQUARE_BILLBOARD_SIZES,
  SQUARE_PRINT_SIZES,
  STATUS_CONFIG,
  VIEWING_PRESETS,
  type Status,
  type ViewingLabel,
} from './calculatorConstants';

const ASPECT_RATIO_PRESETS = ASPECT_RATIOS.filter(
  (ar): ar is (typeof ASPECT_RATIOS)[number] & { value: readonly [number, number] } =>
    Array.isArray(ar.value),
);

/** Infers the closest matching aspect ratio (always returns landscape preset). */
export function inferAspectRatioFromPixels(
  w: number,
  h: number,
): readonly [number, number] | null {
  if (w <= 0 || h <= 0) return null;
  const ratio = Math.max(w, h) / Math.min(w, h);
  const tolerance = 0.05;
  let best: (readonly [number, number]) | null = null;
  let bestDiff = Infinity;
  for (const ar of ASPECT_RATIO_PRESETS) {
    const [rW, rH] = ar.value;
    const presetRatio = Math.max(rW, rH) / Math.min(rW, rH);
    const diff = Math.abs(ratio - presetRatio);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = ar.value;
    }
  }
  return best && bestDiff / (Math.max(...best) / Math.min(...best)) <= tolerance
    ? best
    : null;
}

/** Returns the display label for a preset based on image orientation (portrait = h > w). */
export function getAspectRatioLabel(
  preset: readonly [number, number],
  isPortrait: boolean,
): string {
  if (preset[0] === preset[1]) return '1:1';
  return isPortrait ? `${preset[1]}:${preset[0]}` : `${preset[0]}:${preset[1]}`;
}

/** Longest-side progression for generated sizes (inches for print, feet×12 for billboard). */
const LONG_SIDE_PROGRESSION_PRINT = [4, 5, 6, 8, 10, 12, 16, 20, 24, 30, 36];
const LONG_SIDE_PROGRESSION_BILLBOARD = [60, 72, 96, 120, 144, 192, 240, 288, 360, 432, 480]; // inches (5–40 ft)

function formatSizeLabel(n: number, inFeet: boolean): string {
  if (inFeet) return String(Math.round(n / 12));
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1);
}

/** Generates exactly 11 print/billboard sizes that match the target aspect ratio. */
export function generateSizesForRatio(
  targetRatio: number,
  mode: 'print' | 'billboard',
): { name: string; w: number; h: number }[] {
  if (targetRatio <= 0) return [];
  const progression =
    mode === 'print'
      ? LONG_SIDE_PROGRESSION_PRINT
      : LONG_SIDE_PROGRESSION_BILLBOARD;
  const suffix = mode === 'print' ? '"' : ' ft';
  const inFeet = mode === 'billboard';

  const round = (n: number) => Math.round(n * 100) / 100;

  return progression.map((longSide) => {
    let w: number;
    let h: number;
    if (targetRatio >= 1) {
      w = longSide;
      h = round(longSide / targetRatio);
    } else {
      h = longSide;
      w = round(longSide * targetRatio);
    }
    const name = `${formatSizeLabel(w, inFeet)}×${formatSizeLabel(h, inFeet)}${suffix}`;
    return { name, w, h };
  });
}

/** Returns true if a size's aspect ratio matches the target (effectiveW/effectiveH). */
export function sizeMatchesAspectRatio(
  size: { w: number; h: number },
  targetRatio: number,
  tolerance = 0.08,
): boolean {
  if (targetRatio <= 0) return false;
  const sizeRatioLandscape = size.w / size.h;
  const sizeRatioPortrait = size.h / size.w;
  // Use symmetric denominator so swapping dimensions gives the same result
  const landMatch =
    Math.abs(sizeRatioLandscape - targetRatio) /
      Math.max(targetRatio, sizeRatioLandscape) <=
    tolerance;
  const portMatch =
    Math.abs(sizeRatioPortrait - targetRatio) /
      Math.max(targetRatio, sizeRatioPortrait) <=
    tolerance;
  return landMatch || portMatch;
}

export function getCroppedDimensions(
  origW: number,
  origH: number,
  ratio: readonly [number, number] | null | 'nocrop',
): { w: number; h: number } {
  if (ratio === 'nocrop' || !ratio || origW <= 0 || origH <= 0) return { w: origW, h: origH };
  const [rW, rH] = origH > origW ? [ratio[1], ratio[0]] : ratio;
  const cropW = Math.min(origW, Math.floor((origH * rW) / rH));
  const cropH = Math.min(origH, Math.floor((origW * rH) / rW));
  return { w: cropW, h: cropH };
}

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

/** Computes DPI ratios once and returns both display dimensions and effective DPI. */
function computeDpiMetrics(
  size: { w: number; h: number },
  pw: number,
  ph: number,
): { display: { w: number; h: number }; effectiveDPI: number } {
  const dpiLandW = pw / size.w;
  const dpiLandH = ph / size.h;
  const dpiPortW = pw / size.h;
  const dpiPortH = ph / size.w;
  const landscape = Math.min(dpiLandW, dpiLandH);
  const portrait = Math.min(dpiPortW, dpiPortH);
  const effectiveDPI = Math.max(landscape, portrait);
  const display =
    portrait >= landscape
      ? { w: size.h, h: size.w }
      : { w: size.w, h: size.h };
  return { display, effectiveDPI };
}

export function getDisplayAndEffectiveDPI(
  size: { w: number; h: number },
  pw: number,
  ph: number,
): { display: { w: number; h: number }; effectiveDPI: number } {
  return computeDpiMetrics(size, pw, ph);
}

export function getEffectiveDPI(
  size: { w: number; h: number },
  pw: number,
  ph: number,
) {
  return computeDpiMetrics(size, pw, ph).effectiveDPI;
}

/** Returns the display dimensions in the orientation that fits the user's pixels best. */
export function getDisplayDimensions(
  size: { w: number; h: number },
  pw: number,
  ph: number,
): { w: number; h: number } {
  return computeDpiMetrics(size, pw, ph).display;
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
