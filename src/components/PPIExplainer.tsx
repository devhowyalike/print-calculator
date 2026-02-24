import { COLORS } from "../lib/constants";

export default function PPIExplainer() {
  return (
    <div
      id="ppi-vs-dpi"
      className="mt-12 scroll-mt-6 rounded-[14px] border px-6 py-6"
      style={{ borderColor: COLORS.bgCard, backgroundColor: COLORS.bg }}
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
        <div
          className="rounded-[10px] border px-5 py-4"
          style={{
            borderColor: COLORS.bgCard,
            backgroundColor: COLORS.bgCardDark,
          }}
        >
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
        <div
          className="rounded-[10px] border px-5 py-4"
          style={{
            borderColor: COLORS.bgCard,
            backgroundColor: COLORS.bgCardDark,
          }}
        >
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

      <div
        className="rounded-[10px] border px-5 py-4"
        style={{
          borderColor: COLORS.bgCard,
          backgroundColor: COLORS.bgCardDark,
        }}
      >
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
  );
}
