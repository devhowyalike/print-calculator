import { useState, useMemo } from "react";
import type { Mode } from "../types";
import type { SizeDataItem } from "../types";
import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  COMMON_SIZES,
  BILLBOARD_SIZES,
  SQUARE_PRINT_SIZES,
  SQUARE_BILLBOARD_SIZES,
  VIEWING_PRESETS,
  ASPECT_RATIOS,
  getStatus,
  getEffectiveDPI,
  getDisplayDimensions,
  getCroppedDimensions,
  inferAspectRatioFromPixels,
  generateSizesForRatio,
  getViewingPPI,
  getViewingPPIFromDistance,
} from "../lib/calculator";

import CalculatorHeader from "./CalculatorHeader";
import DimensionInputs from "./DimensionInputs";
import PPIOrViewingSelector from "./PPIOrViewingSelector";
import AspectRatioSelector from "./AspectRatioSelector";
import InfoParagraph from "./InfoParagraph";
import SummaryCards from "./SummaryCards";
import SizesTable from "./SizesTable";
import QualityLegend from "./QualityLegend";
import HelpNotes from "./HelpNotes";

export default function PrintCalculator() {
  const [mode, setMode] = useState<Mode>("print");
  const [dpi, setDpi] = useState(150);
  const [viewingDistanceFt, setViewingDistanceFt] = useState(5);
  const [pixelWStr, setPixelWStr] = useState(String(DEFAULT_WIDTH));
  const [pixelHStr, setPixelHStr] = useState(String(DEFAULT_HEIGHT));
  const [aspectRatio, setAspectRatio] =
    useState<(typeof ASPECT_RATIOS)[number]["value"]>("nocrop");

  const pixelW = parseInt(pixelWStr) || 0;
  const pixelH = parseInt(pixelHStr) || 0;

  const { w: effectiveW, h: effectiveH } = getCroppedDimensions(
    pixelW,
    pixelH,
    aspectRatio,
  );

  const targetRatio =
    effectiveW > 0 && effectiveH > 0 ? effectiveW / effectiveH : 0;
  const closestAspectRatio =
    pixelW > 0 && pixelH > 0
      ? inferAspectRatioFromPixels(pixelW, pixelH)
      : null;
  const isExactAspectMatch =
    closestAspectRatio &&
    pixelW > 0 &&
    pixelH > 0 &&
    (() => {
      const ratio = Math.max(pixelW, pixelH) / Math.min(pixelW, pixelH);
      const [rW, rH] = closestAspectRatio;
      const presetRatio = Math.max(rW, rH) / Math.min(rW, rH);
      return Math.abs(ratio - presetRatio) < 0.0001;
    })();

  const baseSizes = mode === "print" ? COMMON_SIZES : BILLBOARD_SIZES;
  const squareSizes =
    mode === "print" ? SQUARE_PRINT_SIZES : SQUARE_BILLBOARD_SIZES;
  const allSizes = [...squareSizes, ...baseSizes];
  const sizes =
    targetRatio > 0 ? generateSizesForRatio(targetRatio, mode) : allSizes;

  const currentPreset = VIEWING_PRESETS.find(
    (p) => p.distanceFt === viewingDistanceFt,
  );
  const currentPresetPPI =
    currentPreset?.ppi ??
    Math.ceil(getViewingPPIFromDistance(viewingDistanceFt));

  const data = useMemo(() => {
    const w = effectiveW;
    const h = effectiveH;
    return sizes.map((size) => {
      const display = getDisplayDimensions(size, w, h);
      const effectiveDPI = Math.round(getEffectiveDPI(size, w, h));
      const viewingPPI =
        mode === "print" ? getViewingPPI(size) : currentPresetPPI;
      const targetDpi = mode === "print" ? dpi : currentPresetPPI;
      const status = getStatus(size, targetDpi, w, h);
      const fineForDistance =
        effectiveDPI < targetDpi && effectiveDPI >= viewingPPI;
      const formatDim = (n: number) =>
        n % 1 < 0.001 || n % 1 > 0.999
          ? Math.round(n)
          : parseFloat(n.toFixed(1));
      const displayName =
        mode === "print"
          ? `${formatDim(display.w)}×${formatDim(display.h)}"`
          : `${Math.round(display.w / 12)}×${Math.round(display.h / 12)} ft`;
      return {
        ...size,
        displayName,
        status,
        effectiveDPI,
        viewingPPI,
        fineForDistance,
        targetDpi,
      } satisfies SizeDataItem;
    });
  }, [mode, dpi, currentPresetPPI, effectiveW, effectiveH, sizes]);

  const excellent = data.filter((d) => d.status === "perfect").length;
  const lastExcellent = [...data].reverse().find((d) => d.status === "perfect");
  const activeDpi = mode === "print" ? dpi : currentPresetPPI;

  return (
    <>
      <CalculatorHeader
        mode={mode}
        onModeChange={setMode}
        onDimensionsChange={(w, h) => {
          setPixelWStr(w);
          setPixelHStr(h);
        }}
        onAspectRatioReset={() => setAspectRatio("nocrop")}
      />

      <DimensionInputs
        pixelWStr={pixelWStr}
        pixelHStr={pixelHStr}
        onPixelWChange={setPixelWStr}
        onPixelHChange={setPixelHStr}
        onSwap={() => {
          setPixelWStr(pixelHStr);
          setPixelHStr(pixelWStr);
        }}
      />

      {mode === "print" ? (
        <PPIOrViewingSelector
          mode="print"
          dpi={dpi}
          onDpiChange={setDpi}
        />
      ) : (
        <PPIOrViewingSelector
          mode="billboard"
          viewingDistanceFt={viewingDistanceFt}
          onViewingDistanceChange={setViewingDistanceFt}
          currentPreset={currentPreset}
          currentPresetPPI={currentPresetPPI}
        />
      )}

      <AspectRatioSelector
        pixelW={pixelW}
        pixelH={pixelH}
        aspectRatio={aspectRatio}
        effectiveW={effectiveW}
        effectiveH={effectiveH}
        closestAspectRatio={closestAspectRatio}
        isExactAspectMatch={!!isExactAspectMatch}
        onAspectRatioChange={setAspectRatio}
      />

      <InfoParagraph mode={mode} />

      <SummaryCards
        mode={mode}
        data={data}
        excellentCount={excellent}
        lastExcellent={lastExcellent}
      />

      <SizesTable mode={mode} data={data} />

      <QualityLegend activeDpi={activeDpi} />

      {mode === "print" ? (
        <HelpNotes
          mode="print"
          effectiveW={effectiveW}
          effectiveH={effectiveH}
          dpi={dpi}
        />
      ) : (
        <HelpNotes
          mode="billboard"
          effectiveW={effectiveW}
          effectiveH={effectiveH}
          currentPreset={currentPreset}
          currentPresetPPI={currentPresetPPI}
          viewingDistanceFt={viewingDistanceFt}
        />
      )}
    </>
  );
}
