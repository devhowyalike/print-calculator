export const DEFAULT_WIDTH = 4096;
export const DEFAULT_HEIGHT = 5120;

export const BILLBOARD_DEFAULT_WIDTH = 14400;
export const BILLBOARD_DEFAULT_HEIGHT = 7200;

export const BILLBOARD_SIZES = [
  { name: '10x5.6 ft', w: 120, h: 67.5 },
  { name: '16x9 ft', w: 192, h: 108 },
  { name: '21x9 ft', w: 252, h: 108 },
  { name: '5x11 ft', w: 60, h: 132 },
  { name: '6x12 ft', w: 72, h: 144 },
  { name: '8x24 ft', w: 96, h: 288 },
  { name: '10x20 ft', w: 120, h: 240 },
  { name: '10x22 ft', w: 120, h: 264 },
  { name: '11x24 ft', w: 132, h: 288 },
  { name: '12x24 ft', w: 144, h: 288 },
  { name: '12x25 ft', w: 144, h: 300 },
  { name: '10x36 ft', w: 120, h: 432 },
  { name: '18x24 ft', w: 216, h: 288 },
  { name: '12x40 ft', w: 144, h: 480 },
  { name: '14x48 ft', w: 168, h: 576 },
  { name: '20x40 ft', w: 240, h: 480 },
  { name: '16x60 ft', w: 192, h: 720 },
  { name: '24x48 ft', w: 288, h: 576 },
  { name: '20x60 ft', w: 240, h: 720 },
  { name: '30x60 ft', w: 360, h: 720 },
];

export const VIEWING_PRESETS = [
  { label: 'Indoor', distanceFt: 5, ppi: 100, description: 'Trade Show' },
  { label: 'Street', distanceFt: 30, ppi: 35, description: 'Storefront' },
  { label: 'Highway', distanceFt: 500, ppi: 20, description: 'Billboard' },
] as const;

export const ASPECT_RATIOS = [
  { label: 'No Crop', value: 'nocrop' as const },
  { label: '1:1', value: [1, 1] as const },
  { label: '2:1', value: [2, 1] as const },
  { label: '21:9', value: [21, 9] as const },
  { label: '16:9', value: [16, 9] as const },
  { label: '3:2', value: [3, 2] as const },
  { label: '4:3', value: [4, 3] as const },
  { label: '5:4', value: [5, 4] as const },
  { label: '5:7', value: [5, 7] as const },
] as const;

export const COMMON_SIZES = [
  { name: '4x6"', w: 4, h: 6 },
  { name: '5x7"', w: 5, h: 7 },
  { name: '8x4.5"', w: 8, h: 4.5 },
  { name: '14x6"', w: 14, h: 6 },
  { name: '16x9"', w: 16, h: 9 },
  { name: '21x9"', w: 21, h: 9 },
  { name: '10x5"', w: 10, h: 5 },
  { name: '20x10"', w: 20, h: 10 },
  { name: '10x8"', w: 10, h: 8 },
  { name: '20x16"', w: 20, h: 16 },
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

export const SQUARE_PRINT_SIZES = [
  { name: '4x4"', w: 4, h: 4 },
  { name: '5x5"', w: 5, h: 5 },
  { name: '6x6"', w: 6, h: 6 },
  { name: '8x8"', w: 8, h: 8 },
  { name: '10x10"', w: 10, h: 10 },
  { name: '12x12"', w: 12, h: 12 },
  { name: '16x16"', w: 16, h: 16 },
  { name: '20x20"', w: 20, h: 20 },
  { name: '24x24"', w: 24, h: 24 },
  { name: '30x30"', w: 30, h: 30 },
  { name: '36x36"', w: 36, h: 36 },
];

export const SQUARE_BILLBOARD_SIZES = [
  { name: '10x10 ft', w: 120, h: 120 },
  { name: '12x12 ft', w: 144, h: 144 },
  { name: '16x16 ft', w: 192, h: 192 },
  { name: '20x20 ft', w: 240, h: 240 },
  { name: '24x24 ft', w: 288, h: 288 },
  { name: '30x30 ft', w: 360, h: 360 },
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

export type ViewingLabel = (typeof VIEWING_PRESETS)[number]['label'];
