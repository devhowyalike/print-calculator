import { useState, useMemo, useCallback } from "react";
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
  getDisplayAndEffectiveDPI,
  getCroppedDimensions,
  inferAspectRatioFromPixels,
  generateSizesForRatio,
  getViewingPPI,
  getViewingPPIFromDistance,
} from "../lib/calculator";
import {
  getTargetRatio,
  isExactAspectMatch,
  formatDisplayName,
} from "../utils/printUtils";

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

  const targetRatio = getTargetRatio(effectiveW, effectiveH);
  const closestAspectRatio =
    pixelW > 0 && pixelH > 0
      ? inferAspectRatioFromPixels(pixelW, pixelH)
      : null;
  const exactAspectMatch = isExactAspectMatch(
    pixelW,
    pixelH,
    closestAspectRatio,
  );

  const sizes = useMemo(() => {
    const baseSizes = mode === "print" ? COMMON_SIZES : BILLBOARD_SIZES;
    const squareSizes =
      mode === "print" ? SQUARE_PRINT_SIZES : SQUARE_BILLBOARD_SIZES;
    const allSizes = [...squareSizes, ...baseSizes];
    return targetRatio > 0 ? generateSizesForRatio(targetRatio, mode) : allSizes;
  }, [mode, targetRatio]);

  const { currentPreset, currentPresetPPI } = useMemo(() => {
    const preset = VIEWING_PRESETS.find(
      (p) => p.distanceFt === viewingDistanceFt,
    );
    const ppi =
      preset?.ppi ?? Math.ceil(getViewingPPIFromDistance(viewingDistanceFt));
    return { currentPreset: preset, currentPresetPPI: ppi };
  }, [viewingDistanceFt]);

  const { data, excellent, lastExcellent } = useMemo(() => {
    const w = effectiveW;
    const h = effectiveH;
    let excellentCount = 0;
    let lastPerfect: SizeDataItem | undefined;
    const result = sizes.map((size) => {
      const { display, effectiveDPI: rawDpi } = getDisplayAndEffectiveDPI(
        size,
        w,
        h,
      );
      const effectiveDPI = Math.round(rawDpi);
      const viewingPPI =
        mode === "print" ? getViewingPPI(size) : currentPresetPPI;
      const targetDpi = mode === "print" ? dpi : currentPresetPPI;
      const status = getStatus(size, targetDpi, w, h);
      const fineForDistance =
        effectiveDPI < targetDpi && effectiveDPI >= viewingPPI;
      const displayName = formatDisplayName(display.w, display.h, mode);
      const item = {
        ...size,
        displayName,
        status,
        effectiveDPI,
        viewingPPI,
        fineForDistance,
        targetDpi,
      } satisfies SizeDataItem;
      if (status === "perfect") {
        excellentCount++;
        lastPerfect = item;
      }
      return item;
    });
    return {
      data: result,
      excellent: excellentCount,
      lastExcellent: lastPerfect,
    };
  }, [mode, dpi, currentPresetPPI, effectiveW, effectiveH, sizes]);

  const activeDpi = mode === "print" ? dpi : currentPresetPPI;

  const handleDimensionsChange = useCallback((w: string, h: string) => {
    setPixelWStr(w);
    setPixelHStr(h);
  }, []);

  const handleAspectRatioReset = useCallback(() => setAspectRatio("nocrop"), []);

  const handleSwap = useCallback(() => {
    setPixelWStr(pixelHStr);
    setPixelHStr(pixelWStr);
  }, [pixelWStr, pixelHStr]);

  return (
    <>
      <CalculatorHeader
        mode={mode}
        onModeChange={setMode}
        onDimensionsChange={handleDimensionsChange}
        onAspectRatioReset={handleAspectRatioReset}
      />

      <DimensionInputs
        pixelWStr={pixelWStr}
        pixelHStr={pixelHStr}
        onPixelWChange={setPixelWStr}
        onPixelHChange={setPixelHStr}
        onSwap={handleSwap}
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
        isExactAspectMatch={exactAspectMatch}
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
