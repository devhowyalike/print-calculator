// WebMCP tool registration using the W3C Draft Spec:
// https://webmachinelearning.github.io/webmcp/
//
// The native navigator.modelContext API is not yet implemented in browsers.
// This file registers tools so the app is ready when browser support lands.

import {
  getStatus,
  getDisplayAndEffectiveDPI,
  getViewingPPI,
  getViewingPPIFromDistance,
  COMMON_SIZES,
  STATUS_CONFIG,
  getPPIDescription,
  type Status,
} from "#/lib/calculator";

if (!navigator.modelContext) {
  console.info(
    "[WebMCP] navigator.modelContext is not available in this browser. " +
      "See https://github.com/webmachinelearning/webmcp for the spec status."
  );
} else {
  navigator.modelContext.provideContext({
    tools: [
      {
        name: "calculatePrintQuality",
        description:
          "Calculate the print quality for a given image resolution and print size. " +
          "Returns quality status (Excellent/Good/Marginal/Too Low), effective DPI, " +
          "and whether it meets the target DPI.",
        inputSchema: {
          type: "object",
          properties: {
            imageWidth: {
              type: "integer",
              minimum: 1,
              description: "Image width in pixels",
            },
            imageHeight: {
              type: "integer",
              minimum: 1,
              description: "Image height in pixels",
            },
            printWidthInches: {
              type: "number",
              exclusiveMinimum: 0,
              description: "Print width in inches (e.g. 8 for an 8×10 print)",
            },
            printHeightInches: {
              type: "number",
              exclusiveMinimum: 0,
              description: "Print height in inches (e.g. 10 for an 8×10 print)",
            },
            targetDpi: {
              type: "integer",
              minimum: 1,
              default: 300,
              description:
                "Target DPI: 150 = standard (good across the room), 200 = high quality (arm's length), 300 = maximum (handheld). Defaults to 300.",
            },
          },
          required: [
            "imageWidth",
            "imageHeight",
            "printWidthInches",
            "printHeightInches",
          ],
        },
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const {
            imageWidth,
            imageHeight,
            printWidthInches,
            printHeightInches,
            targetDpi = 300,
          } = input as {
            imageWidth: number;
            imageHeight: number;
            printWidthInches: number;
            printHeightInches: number;
            targetDpi?: number;
          };

          const size = { w: printWidthInches, h: printHeightInches };
          const status: Status = getStatus(size, targetDpi, imageWidth, imageHeight);
          const { display, effectiveDPI } = getDisplayAndEffectiveDPI(
            size,
            imageWidth,
            imageHeight
          );
          const viewingPPI = getViewingPPI(size);
          const config = STATUS_CONFIG[status];

          return {
            status,
            label: config.label,
            effectiveDPI: Math.round(effectiveDPI),
            targetDpi,
            targetDpiDescription: getPPIDescription(targetDpi),
            meetsTargetDpi: effectiveDPI >= targetDpi,
            viewingDistancePPI: viewingPPI,
            printOrientation: `${display.w}×${display.h}"`,
            summary: `${config.label} — ${Math.round(effectiveDPI)} DPI effective for a ${printWidthInches}×${printHeightInches}" print`,
          };
        },
      },

      {
        name: "getPrintSizeTable",
        description:
          "Get a quality table for an image across all common print sizes at a given target DPI. " +
          "Returns each size with its quality rating and effective DPI. " +
          "Optionally filter to only show sizes at or above a minimum quality level.",
        inputSchema: {
          type: "object",
          properties: {
            imageWidth: {
              type: "integer",
              minimum: 1,
              description: "Image width in pixels",
            },
            imageHeight: {
              type: "integer",
              minimum: 1,
              description: "Image height in pixels",
            },
            targetDpi: {
              type: "integer",
              minimum: 1,
              default: 300,
              description: "Target DPI. Defaults to 300.",
            },
            minQuality: {
              type: "string",
              enum: ["perfect", "acceptable", "stretch", "poor"],
              description:
                "Filter to only show sizes at or above this quality. " +
                "perfect = meets DPI exactly, acceptable = within 85%, stretch = 60–85%, poor = below 60%.",
            },
          },
          required: ["imageWidth", "imageHeight"],
        },
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const {
            imageWidth,
            imageHeight,
            targetDpi = 300,
            minQuality,
          } = input as {
            imageWidth: number;
            imageHeight: number;
            targetDpi?: number;
            minQuality?: Status;
          };

          const ORDER: Status[] = ["perfect", "acceptable", "stretch", "poor"];
          const minIndex = minQuality
            ? ORDER.indexOf(minQuality)
            : ORDER.length - 1;

          const rows = COMMON_SIZES.map((size) => {
            const status = getStatus(size, targetDpi, imageWidth, imageHeight);
            const { effectiveDPI } = getDisplayAndEffectiveDPI(
              size,
              imageWidth,
              imageHeight
            );
            return {
              size: size.name,
              status,
              label: STATUS_CONFIG[status].label,
              effectiveDPI: Math.round(effectiveDPI),
            };
          }).filter(({ status }) => ORDER.indexOf(status) <= minIndex);

          return { imageWidth, imageHeight, targetDpi, sizes: rows };
        },
      },

      {
        name: "getLargestGoodPrintSize",
        description:
          "Find the largest print size an image can achieve at a given quality level and target DPI. " +
          "Searches all common print sizes and returns the largest that qualifies.",
        inputSchema: {
          type: "object",
          properties: {
            imageWidth: {
              type: "integer",
              minimum: 1,
              description: "Image width in pixels",
            },
            imageHeight: {
              type: "integer",
              minimum: 1,
              description: "Image height in pixels",
            },
            targetDpi: {
              type: "integer",
              minimum: 1,
              default: 300,
              description: "Target DPI. Defaults to 300.",
            },
            quality: {
              type: "string",
              enum: ["perfect", "acceptable"],
              default: "acceptable",
              description:
                'Minimum quality to accept: "perfect" = meets DPI exactly, "acceptable" = within 85%. Defaults to "acceptable".',
            },
          },
          required: ["imageWidth", "imageHeight"],
        },
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const {
            imageWidth,
            imageHeight,
            targetDpi = 300,
            quality = "acceptable",
          } = input as {
            imageWidth: number;
            imageHeight: number;
            targetDpi?: number;
            quality?: "perfect" | "acceptable";
          };

          const ORDER: Status[] = ["perfect", "acceptable", "stretch", "poor"];
          const maxIndex = ORDER.indexOf(quality);

          const qualifying = COMMON_SIZES.filter((size) => {
            const status = getStatus(size, targetDpi, imageWidth, imageHeight);
            return ORDER.indexOf(status) <= maxIndex;
          });

          if (qualifying.length === 0) {
            return {
              found: false,
              message: `No common print sizes qualify as "${quality}" for a ${imageWidth}×${imageHeight}px image at ${targetDpi} DPI. Try targetDpi 150 or 200.`,
            };
          }

          const largest = qualifying[qualifying.length - 1];
          const { effectiveDPI } = getDisplayAndEffectiveDPI(
            largest,
            imageWidth,
            imageHeight
          );

          return {
            found: true,
            largestSize: largest.name,
            effectiveDPI: Math.round(effectiveDPI),
            allQualifyingSizes: qualifying.map((s) => s.name),
          };
        },
      },

      {
        name: "calculateBillboardQuality",
        description:
          "Calculate print quality for a large-format billboard. " +
          "Uses viewing-distance-based PPI rather than a fixed DPI target — " +
          "billboard quality is judged by whether the image looks sharp at the expected viewing distance.",
        inputSchema: {
          type: "object",
          properties: {
            imageWidth: {
              type: "integer",
              minimum: 1,
              description: "Image width in pixels",
            },
            imageHeight: {
              type: "integer",
              minimum: 1,
              description: "Image height in pixels",
            },
            billboardWidthFt: {
              type: "number",
              exclusiveMinimum: 0,
              description: "Billboard width in feet",
            },
            billboardHeightFt: {
              type: "number",
              exclusiveMinimum: 0,
              description: "Billboard height in feet",
            },
            viewingDistanceFt: {
              type: "number",
              exclusiveMinimum: 0,
              default: 30,
              description:
                "Expected viewing distance in feet. Defaults to 30 (storefront/street). " +
                "Use 5 for indoor trade show, 500 for highway billboard.",
            },
          },
          required: [
            "imageWidth",
            "imageHeight",
            "billboardWidthFt",
            "billboardHeightFt",
          ],
        },
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const {
            imageWidth,
            imageHeight,
            billboardWidthFt,
            billboardHeightFt,
            viewingDistanceFt = 30,
          } = input as {
            imageWidth: number;
            imageHeight: number;
            billboardWidthFt: number;
            billboardHeightFt: number;
            viewingDistanceFt?: number;
          };

          const size = {
            w: billboardWidthFt * 12,
            h: billboardHeightFt * 12,
          };
          const requiredPPI = getViewingPPIFromDistance(viewingDistanceFt);
          const status: Status = getStatus(size, requiredPPI, imageWidth, imageHeight);
          const { effectiveDPI } = getDisplayAndEffectiveDPI(
            size,
            imageWidth,
            imageHeight
          );
          const config = STATUS_CONFIG[status];

          return {
            status,
            label: config.label,
            effectiveDPI: Math.round(effectiveDPI),
            requiredPPI: Math.round(requiredPPI),
            viewingDistanceFt,
            meetsRequirement: effectiveDPI >= requiredPPI,
            summary: `${config.label} — ${Math.round(effectiveDPI)} DPI effective for a ${billboardWidthFt}×${billboardHeightFt} ft billboard at ${viewingDistanceFt} ft`,
          };
        },
      },

      {
        name: "calculateRequiredResolution",
        description:
          "Calculate the minimum pixel resolution needed to print at a specific size and quality. " +
          "Returns the required pixel dimensions and megapixel count.",
        inputSchema: {
          type: "object",
          properties: {
            printWidthInches: {
              type: "number",
              exclusiveMinimum: 0,
              description: "Desired print width in inches",
            },
            printHeightInches: {
              type: "number",
              exclusiveMinimum: 0,
              description: "Desired print height in inches",
            },
            targetDpi: {
              type: "integer",
              minimum: 1,
              default: 300,
              description:
                "Target DPI: 150 = standard, 200 = high quality, 300 = maximum. Defaults to 300.",
            },
          },
          required: ["printWidthInches", "printHeightInches"],
        },
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const {
            printWidthInches,
            printHeightInches,
            targetDpi = 300,
          } = input as {
            printWidthInches: number;
            printHeightInches: number;
            targetDpi?: number;
          };

          const requiredWidth = Math.ceil(printWidthInches * targetDpi);
          const requiredHeight = Math.ceil(printHeightInches * targetDpi);
          const megapixels =
            (requiredWidth * requiredHeight) / 1_000_000;

          return {
            targetDpi,
            targetDpiDescription: getPPIDescription(targetDpi),
            printSize: `${printWidthInches}×${printHeightInches}"`,
            requiredWidth,
            requiredHeight,
            megapixels: parseFloat(megapixels.toFixed(1)),
            summary: `${printWidthInches}×${printHeightInches}" at ${targetDpi} DPI requires ${requiredWidth}×${requiredHeight}px (${megapixels.toFixed(1)} MP)`,
          };
        },
      },
    ],
  });

  console.info("[WebMCP] Tools registered via navigator.modelContext.");
}
