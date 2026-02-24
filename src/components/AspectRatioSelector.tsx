import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./ui/collapsible";
import {
  ASPECT_RATIOS,
  getAspectRatioLabel,
  toggleButtonClass,
} from "../lib/calculator";

type AspectRatioValue = (typeof ASPECT_RATIOS)[number]["value"];

type AspectRatioSelectorProps = {
  pixelW: number;
  pixelH: number;
  aspectRatio: AspectRatioValue;
  effectiveW: number;
  effectiveH: number;
  closestAspectRatio: readonly [number, number] | null;
  isExactAspectMatch: boolean;
  onAspectRatioChange: (value: AspectRatioValue) => void;
};

function AspectRatioButtons({
  pixelW,
  pixelH,
  aspectRatio,
  effectiveW,
  effectiveH,
  closestAspectRatio,
  isExactAspectMatch,
  onAspectRatioChange,
}: AspectRatioSelectorProps) {
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {ASPECT_RATIOS.map((ar) => {
          const isPortrait = pixelH > pixelW;
          const label = Array.isArray(ar.value)
            ? getAspectRatioLabel(
                ar.value as readonly [number, number],
                isPortrait,
              )
            : ar.label;
          const activeRatio = Array.isArray(aspectRatio) ? aspectRatio : null;
          const isSelected =
            ar.value === "nocrop"
              ? aspectRatio === "nocrop"
              : Array.isArray(ar.value) && activeRatio
                ? ar.value[0] === activeRatio[0] &&
                  ar.value[1] === activeRatio[1]
                : aspectRatio === ar.value;
          const isClosest =
            closestAspectRatio &&
            Array.isArray(ar.value) &&
            ar.value[0] === closestAspectRatio[0] &&
            ar.value[1] === closestAspectRatio[1];
          return (
            <button
              key={ar.label}
              onClick={() => onAspectRatioChange(ar.value)}
              className={`cursor-pointer rounded-lg px-[14px] py-[7px] text-sm font-medium transition-all duration-200 ${toggleButtonClass(isSelected)}`}
            >
              <span
                className={isClosest ? "border-b-2 border-blue-500 pb-0.5" : ""}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {aspectRatio !== "nocrop" && aspectRatio && (
        <span className="text-sm text-zinc-500 flex items-center gap-1.5">
          Using {effectiveW.toLocaleString()}×{effectiveH.toLocaleString()} px
          {closestAspectRatio &&
            Array.isArray(aspectRatio) &&
            aspectRatio[0] === closestAspectRatio[0] &&
            aspectRatio[1] === closestAspectRatio[1] && (
              <>
                <span className="inline-block w-4 border-b-2 border-blue-500" />
                {isExactAspectMatch
                  ? "Your aspect ratio"
                  : "Closest match to your image"}
              </>
            )}
        </span>
      )}
    </>
  );
}

export default function AspectRatioSelector(props: AspectRatioSelectorProps) {
  const [open, setOpen] = useState(false);

  const currentLabel =
    props.aspectRatio === "nocrop"
      ? "No Crop"
      : Array.isArray(props.aspectRatio)
        ? getAspectRatioLabel(
            props.aspectRatio as readonly [number, number],
            props.pixelH > props.pixelW,
          )
        : "";

  return (
    <div className="mb-7 rounded-2xl border border-white/6 bg-app-card-surface px-5 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer">
          <span className="whitespace-nowrap text-[13px] font-medium tracking-wide uppercase text-zinc-500">
            Aspect Ratio
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">{currentLabel}</span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 flex flex-col gap-3">
          <AspectRatioButtons {...props} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
