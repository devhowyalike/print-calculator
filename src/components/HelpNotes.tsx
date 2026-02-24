type ViewingPreset = {
  label: string;
  distanceFt: number;
  ppi?: number;
  description?: string;
};

type HelpNotesProps =
  | {
      mode: "print";
      effectiveW: number;
      effectiveH: number;
      dpi: number;
    }
  | {
      mode: "billboard";
      effectiveW: number;
      effectiveH: number;
      currentPreset: ViewingPreset | undefined;
      currentPresetPPI: number;
      viewingDistanceFt: number;
    };

export default function HelpNotes(props: HelpNotesProps) {
  const { effectiveW, effectiveH } = props;

  return (
    <ul className="mt-6 space-y-2.5 list-disc pl-5 text-lg leading-relaxed text-zinc-400 text-pretty">
      <li>Both landscape and portrait orientations are considered.</li>
      <li>
        <span className="text-zinc-200">"Your PPI"</span> shows the effective
        resolution your {effectiveW}×{effectiveH} file achieves at each{" "}
        {props.mode === "billboard" ? "billboard" : "print"} size.
      </li>
      {props.mode === "print" ? (
        <>
          <li>
            Quality ratings compare this against your{" "}
            <span className="text-zinc-200">{props.dpi} PPI target</span> — they
            reflect whether your image has enough pixels, not whether the print
            will look bad.
          </li>
          <li>
            <span className="text-blue-400">Min PPI</span> is the lowest
            resolution the human eye can distinguish at a typical viewing
            distance for that size (1.5× the diagonal).
          </li>
          <li>
            If your PPI exceeds the min, the print will look sharp in practice —
            even if it's below your target.
          </li>
        </>
      ) : (
        <li>
          Quality ratings compare your PPI against the{" "}
          <span className="text-zinc-200">{props.currentPresetPPI} PPI</span>{" "}
          industry standard for{" "}
          <span className="text-zinc-200">
            {props.currentPreset?.label.toLowerCase() ?? "this"} viewing (~
            {props.viewingDistanceFt} ft)
          </span>
          . Below this, the image will look soft at that distance.
        </li>
      )}
    </ul>
  );
}
