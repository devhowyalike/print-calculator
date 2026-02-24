/** Formats a dimension for display (rounds whole numbers, 1 decimal for fractions). */
export function formatDim(n: number): number {
  return n % 1 < 0.001 || n % 1 > 0.999
    ? Math.round(n)
    : parseFloat(n.toFixed(1));
}

/** Returns the aspect ratio from dimensions, or 0 if invalid. */
export function getTargetRatio(w: number, h: number): number {
  return w > 0 && h > 0 ? w / h : 0;
}

/** Returns true if pixel dimensions exactly match the preset aspect ratio. */
export function isExactAspectMatch(
  pixelW: number,
  pixelH: number,
  preset: readonly [number, number] | null,
): boolean {
  if (!preset || pixelW <= 0 || pixelH <= 0) return false;
  const ratio = Math.max(pixelW, pixelH) / Math.min(pixelW, pixelH);
  const [rW, rH] = preset;
  const presetRatio = Math.max(rW, rH) / Math.min(rW, rH);
  return Math.abs(ratio - presetRatio) < 0.0001;
}

/** Formats display name for a size (print: inches, billboard: feet). */
export function formatDisplayName(
  displayW: number,
  displayH: number,
  mode: "print" | "billboard",
): string {
  if (mode === "print") {
    return `${formatDim(displayW)}×${formatDim(displayH)}"`;
  }
  return `${Math.round(displayW / 12)}×${Math.round(displayH / 12)} ft`;
}
