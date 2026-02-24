export type Mode = "print" | "billboard";

export type SizeDataItem = {
  name: string;
  w: number;
  h: number;
  displayName: string;
  status: "perfect" | "acceptable" | "stretch" | "poor";
  effectiveDPI: number;
  viewingPPI: number;
  fineForDistance: boolean;
  targetDpi: number;
};
