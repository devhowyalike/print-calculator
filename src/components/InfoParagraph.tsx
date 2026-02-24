import type { Mode } from "../types";

type InfoParagraphProps = {
  mode: Mode;
};

export default function InfoParagraph({ mode }: InfoParagraphProps) {
  return (
    <p className="mb-7 mt-[-16px] text-sm leading-relaxed text-zinc-500">
      {mode === "print" ? (
        <>
          This calculator uses pixel dimensions only (PPI) — the DPI metadata
          embedded in your image file doesn't affect the results.{" "}
          <a
            href="#ppi-vs-dpi"
            className="text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition-colors hover:text-zinc-200"
          >
            Learn more ↓
          </a>
        </>
      ) : (
        <>
          Billboard sizes are rated against industry-standard PPI targets for
          the selected viewing context. Quality ratings reflect whether your
          file has enough pixels for sharp output at that distance.
        </>
      )}
    </p>
  );
}
