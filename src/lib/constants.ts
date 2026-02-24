/** Theme colors used across the app. */
export const COLORS = {
  bg: "#131316",
  bgCard: "#1c1c21",
  bgCardDark: "#0e0e10",
  border: "#1a1a1f",
  hover: "#25252b",
  highlight: "#38bdf8",
  muted: "#71717a",
} as const;

/** Target PPI options for print mode. */
export const PPI_OPTIONS = [150, 200, 300] as const;

export type PPIValue = (typeof PPI_OPTIONS)[number];

/** Returns the quality description for a given PPI target. */
export function getPPIDescription(dpi: number): string {
  if (dpi <= 150) return "Standard — good across the room";
  if (dpi <= 200) return "High quality — good at arm's length";
  return "Maximum — good handheld";
}
