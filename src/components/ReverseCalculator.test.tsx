// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ReverseCalculator from "./ReverseCalculator";

afterEach(cleanup);

function setField(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("ReverseCalculator", () => {
  it("computes exact pixels for fractional inches at high DPI", () => {
    const { container } = render(<ReverseCalculator />);
    setField("Print width in inches", "8.5");
    setField("Print height in inches", "11");
    setField("Target DPI", "300");
    // 8.5 * 300 = 2550, 11 * 300 = 3300 — no rounding slack.
    expect(container.textContent).toMatch(/2,550\s*×\s*3,300/);
  });

  it("keeps the size exact after toggling to feet (no lossy conversion)", () => {
    const { container } = render(<ReverseCalculator />);
    setField("Print width in inches", "8.5");
    setField("Print height in inches", "8.5");
    // Feet display rounds to 0.708, but the underlying 8.5" must be preserved.
    fireEvent.click(screen.getByText("feet"));
    setField("Target DPI", "300");
    // Must be 2550 (from 8.5"), not 2549 (from 0.708 ft × 12).
    expect(container.textContent).toMatch(/2,550\s*×\s*2,550/);
  });

  it("marks the size approximate when feet rounding hides precision", () => {
    const { container } = render(<ReverseCalculator />);
    setField("Print width in inches", "8.5");
    setField("Print height in inches", "8.5");
    fireEvent.click(screen.getByText("feet")); // 8.5" shows as 0.708 ft
    expect(container.textContent).toContain("≈");
  });

  it("does not mark exact feet values as approximate", () => {
    const { container } = render(<ReverseCalculator />);
    setField("Print width in inches", "24"); // 2 ft exactly
    setField("Print height in inches", "36"); // 3 ft exactly
    fireEvent.click(screen.getByText("feet"));
    expect(container.textContent).not.toContain("≈");
  });

  it("collapses to a placeholder when a dimension is cleared", () => {
    const { container } = render(<ReverseCalculator />);
    setField("Print width in inches", "");
    // No stale required-pixels value should remain.
    expect(container.textContent).not.toMatch(/\d,\d{3}\s*×\s*\d,\d{3}/);
  });
});
