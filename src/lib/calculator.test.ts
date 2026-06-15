import { describe, it, expect } from "vitest";
import {
  getRequiredPixels,
  getAspectRatioString,
  formatDim,
  formatDisplayName,
  getBillboardPPIDescription,
  generateSizesForRatio,
} from "./calculator";

describe("getRequiredPixels", () => {
  it("multiplies inches by DPI for whole results", () => {
    expect(getRequiredPixels(30, 40, 200)).toMatchObject({ w: 6000, h: 8000 });
  });

  it("rounds up (never below the target) on fractional products", () => {
    // 10.1 * 15 = 151.5 — must clear 152, not truncate to 151 or round to 152.
    expect(getRequiredPixels(10.1, 10.1, 15).w).toBe(152);
    // 5.3 * 151 = 800.3 — Math.round would give 800 and under-report.
    expect(getRequiredPixels(5.3, 5.3, 151).w).toBe(801);
  });

  it("clamps negative or zero input to zero", () => {
    expect(getRequiredPixels(-5, 0, 200)).toMatchObject({ w: 0, h: 0 });
  });

  it("reports megapixels from the pixel dimensions", () => {
    expect(getRequiredPixels(30, 40, 200).megapixels).toBeCloseTo(48, 5);
  });
});

describe("getAspectRatioString", () => {
  it("reduces to a simplified integer ratio", () => {
    expect(getAspectRatioString(30, 40)).toBe("3 : 4");
    expect(getAspectRatioString(8, 8)).toBe("1 : 1");
  });

  it("falls back to a decimal form when terms get large", () => {
    expect(getAspectRatioString(100, 3)).toBe("33.33 : 1");
  });

  it("returns null for non-positive dimensions", () => {
    expect(getAspectRatioString(0, 5)).toBeNull();
    expect(getAspectRatioString(5, -1)).toBeNull();
  });
});

describe("formatDim", () => {
  it("keeps whole numbers whole and fractions to one decimal", () => {
    expect(formatDim(30)).toBe(30);
    expect(formatDim(2.5)).toBe(2.5);
    expect(formatDim(40 / 12)).toBe(3.3);
  });
});

describe("formatDisplayName", () => {
  it("uses inches for print", () => {
    expect(formatDisplayName(30, 40, "print")).toBe('30×40"');
  });

  it("uses feet for billboard", () => {
    expect(formatDisplayName(120, 240, "billboard")).toBe("10×20 ft");
  });

  it("treats reverse as inches, not feet", () => {
    expect(formatDisplayName(30, 40, "reverse")).toBe('30×40"');
  });
});

describe("getBillboardPPIDescription", () => {
  it("maps a PPI to its closest viewing preset", () => {
    expect(getBillboardPPIDescription(100)).toContain("Indoor");
    expect(getBillboardPPIDescription(35)).toContain("Street");
    expect(getBillboardPPIDescription(20)).toContain("Highway");
  });

  it("snaps an off-preset value to the nearest preset", () => {
    // 50 is closer to 35 (Street) than to 100 (Indoor).
    expect(getBillboardPPIDescription(50)).toContain("Street");
  });
});

describe("generateSizesForRatio", () => {
  it("generates large print sizes for a 3:4 image", () => {
    const names = generateSizesForRatio(0.75, "print").map((s) => s.name);
    expect(names).toContain('30×40"');
    expect(names).toContain('36×48"');
  });

  it("labels billboard sizes in feet", () => {
    const sizes = generateSizesForRatio(2, "billboard");
    expect(sizes.every((s) => s.name.endsWith(" ft"))).toBe(true);
  });

  it("returns nothing for a non-positive ratio", () => {
    expect(generateSizesForRatio(0, "print")).toEqual([]);
  });
});
