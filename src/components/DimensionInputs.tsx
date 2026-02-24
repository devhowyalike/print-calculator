import { ArrowLeftRight } from "lucide-react";

type DimensionInputsProps = {
  pixelWStr: string;
  pixelHStr: string;
  onPixelWChange: (value: string) => void;
  onPixelHChange: (value: string) => void;
  onSwap: () => void;
};

export default function DimensionInputs({
  pixelWStr,
  pixelHStr,
  onPixelWChange,
  onPixelHChange,
  onSwap,
}: DimensionInputsProps) {
  const pixelW = parseInt(pixelWStr) || 0;
  const pixelH = parseInt(pixelHStr) || 0;

  const handleBlur = (
    value: string,
    setter: (v: string) => void,
  ) => {
    const n = parseInt(value);
    setter(String(isNaN(n) || n < 0 ? 0 : n));
  };

  return (
    <div className="mb-3 flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#131316] px-[18px] py-3.5">
      <span className="whitespace-nowrap text-[13px] font-medium text-zinc-500">
        Pixels
      </span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={pixelWStr}
          onChange={(e) => onPixelWChange(e.target.value)}
          onBlur={(e) => handleBlur(e.target.value, onPixelWChange)}
          className="w-[80px] sm:w-[90px] rounded-lg border border-zinc-700 bg-[#1c1c21] px-3 py-[7px] text-center font-mono text-sm font-medium text-zinc-200 outline-none focus:border-zinc-500"
        />
        <span className="text-base font-light text-zinc-700">x</span>
        <input
          type="number"
          value={pixelHStr}
          onChange={(e) => onPixelHChange(e.target.value)}
          onBlur={(e) => handleBlur(e.target.value, onPixelHChange)}
          className="w-[80px] sm:w-[90px] rounded-lg border border-zinc-700 bg-[#1c1c21] px-3 py-[7px] text-center font-mono text-sm font-medium text-zinc-200 outline-none focus:border-zinc-500"
        />
        <span className="text-xs text-zinc-700">px</span>
        <button
          type="button"
          onClick={onSwap}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-[#1c1c21] text-zinc-500 transition-colors hover:border-zinc-600 hover:bg-[#25252b] hover:text-zinc-300"
          title="Swap dimensions"
          aria-label="Swap width and height"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1" />
      <span className="font-mono text-xs sm:text-sm text-white whitespace-nowrap">
        {((pixelW * pixelH) / 1000000).toFixed(1)} MP
      </span>
    </div>
  );
}
