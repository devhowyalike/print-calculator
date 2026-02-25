import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight } from "lucide-react";

type DimensionInputsProps = {
  pixelWStr: string;
  pixelHStr: string;
  megapixels: string;
  onPixelWChange: (value: string) => void;
  onPixelHChange: (value: string) => void;
  onSwap: () => void;
};

export default function DimensionInputs({
  pixelWStr,
  pixelHStr,
  megapixels,
  onPixelWChange,
  onPixelHChange,
  onSwap,
}: DimensionInputsProps) {
  const STICKY_TOP_PX = 12;
  const [isStuck, setIsStuck] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateStickyState = () => {
      const el = containerRef.current;
      if (!el) return;

      const nextIsStuck =
        window.scrollY > 0 &&
        el.getBoundingClientRect().top <= STICKY_TOP_PX + 0.5;

      setIsStuck((prev) => (prev === nextIsStuck ? prev : nextIsStuck));
    };

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", updateStickyState);

    return () => {
      window.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", updateStickyState);
    };
  }, []);

  const handleBlur = (value: string, setter: (v: string) => void) => {
    const n = parseInt(value);
    setter(String(isNaN(n) || n < 0 ? 0 : n));
  };

  return (
    <div
      ref={containerRef}
      className="sticky top-3 z-20 mb-4 flex flex-col gap-3 rounded-2xl border border-white/6 bg-app-card-surface px-5 py-5 transition-shadow duration-200 sm:flex-row sm:items-center sm:gap-4"
      style={{
        boxShadow: isStuck
          ? "0 12px 26px rgba(0, 0, 0, 0.34), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)"
          : "inset 0 1px 0 0 rgba(255, 255, 255, 0.04)",
      }}
    >
      <span className="whitespace-nowrap text-[13px] font-medium tracking-wide uppercase text-zinc-500">
        Pixels
      </span>
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <span className="flex items-center justify-center rounded-l-lg border border-r-0 border-white/8 bg-app-card px-2 py-[7px] text-sm font-medium text-zinc-500">W</span>
          <input
            type="number"
            value={pixelWStr}
            onChange={(e) => onPixelWChange(e.target.value)}
            onBlur={(e) => handleBlur(e.target.value, onPixelWChange)}
            className="w-[80px] sm:w-[90px] rounded-r-lg border border-l-0 border-white/8 bg-app-card px-3 py-[7px] text-center font-mono text-sm font-medium text-zinc-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-white/15 focus:ring-1 focus:ring-white/8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          />
        </div>
        <button
          type="button"
          onClick={onSwap}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-app-card text-zinc-500 transition-colors hover:border-white/15 hover:bg-app-hover hover:text-zinc-300"
          title="Swap dimensions"
          aria-label="Swap width and height"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <div className="flex items-center">
          <span className="flex items-center justify-center rounded-l-lg border border-r-0 border-white/8 bg-app-card px-2 py-[7px] text-sm font-medium text-zinc-500">H</span>
          <input
            type="number"
            value={pixelHStr}
            onChange={(e) => onPixelHChange(e.target.value)}
            onBlur={(e) => handleBlur(e.target.value, onPixelHChange)}
            className="w-[80px] sm:w-[90px] rounded-r-lg border border-l-0 border-white/8 bg-app-card px-3 py-[7px] text-center font-mono text-sm font-medium text-zinc-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-white/15 focus:ring-1 focus:ring-white/8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          />
        </div>
        <span className="text-xs text-white">px</span>
      </div>
      <span className="sm:flex-1" />
      <span className="font-mono text-xs sm:text-sm text-white whitespace-nowrap">
        {megapixels} MP
      </span>
    </div>
  );
}
