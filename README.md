# Pixel to Print Calculator

A tool for photographers, designers and artists to determine which print sizes their digital images can support at a given quality level.

<img src="public/print-screenshot.png" alt="Print Calculator screenshot" style="max-width: 650px;">

Enter your image's pixel dimensions and choose a target PPI — the calculator evaluates 15 common print sizes (4×6" through 36×48") and rates each one as **Excellent**, **Good**, **Marginal**, or **Too Low** based on the effective resolution your file achieves.

It also shows the perceptual minimum PPI for each size (based on typical viewing distance), so you can see when a print will look sharp in practice even if it falls below your technical target.

> [!NOTE]
> Quality ratings are based on perceptual heuristics (viewing distance, visual acuity estimates) and are intended as a practical guide, not a definitive standard. Calculations may be inaccurate. Results may vary depending on the printer, paper, viewing conditions, and individual perception. Use at your own risk.

## Features

- Instant quality ratings across 15 standard print sizes
- Considers both landscape and portrait orientations
- Perceptual min-PPI threshold per size (1-arcminute visual acuity at 1.5× diagonal)
- Summary cards: printable count, largest excellent size, max PPI at that size
- PPI vs DPI explainer section

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Build

```bash
npm run build
npm run preview
```

## 🧪 WebMCP (Experimental)

This project implements the [W3C WebMCP draft spec](https://webmachinelearning.github.io/webmcp/) — a proposed browser API that lets web pages expose JavaScript functions as "tools" that AI agents can discover and call directly.

### What it is

WebMCP proposes a native browser API — `navigator.modelContext` — that works like a client-side MCP server. Instead of building a backend to serve tools over HTTP, a page registers them in JavaScript and the browser makes them available to any AI agent or assistive technology that has access to the tab.

```js
navigator.modelContext.provideContext({
  tools: [
    {
      name: "calculatePrintQuality",
      description:
        "Calculate print quality for a given image resolution and size.",
      inputSchema: {
        /* JSON Schema */
      },
      execute: async (input, client) => {
        /* ... */
      },
    },
  ],
});
```

Five tools are registered at page load in [`src/mcp.ts`](src/mcp.ts):

| Tool                          | Description                                                     |
| ----------------------------- | --------------------------------------------------------------- |
| `calculatePrintQuality`       | Quality status + effective DPI for a given image and print size |
| `getPrintSizeTable`           | Quality ratings across all common print sizes                   |
| `getLargestGoodPrintSize`     | Largest achievable size at a given quality threshold            |
| `calculateBillboardQuality`   | Large-format quality using viewing-distance PPI                 |
| `calculateRequiredResolution` | Min pixel resolution needed to hit a size/DPI target            |

### Current status

`navigator.modelContext` is a **draft community group report** — no browser has implemented it yet. The tools are registered but silently inert in all current browsers.

To test locally, a dev-only polyfill in [`src/webmcp-polyfill.ts`](src/webmcp-polyfill.ts) implements the API in-memory and exposes `window.__webmcp__` in the browser console:

```js
// List all registered tools
__webmcp__.list();

// Call a tool
__webmcp__.call("getLargestGoodPrintSize", {
  imageWidth: 4096,
  imageHeight: 5120,
});

// Inspect a tool's JSON Schema
__webmcp__.schema("calculatePrintQuality");
```

The polyfill is gated behind `import.meta.env.DEV` and is stripped from production builds.

### Limitations

Currently, `navigator.modelContext` is a same-tab, same-process API. Tools registered here are **not** network-accessible — a separate app or server cannot call them directly. For network-accessible tools, a standalone MCP server or REST API would be required. See the [WebMCP explainer](https://github.com/webmachinelearning/webmcp) for the full rationale and design goals.

## Tech Stack

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)

## Contributing

Bug reports and pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

> [!NOTE]
> This project uses [pnpm](https://pnpm.io) for development and maintains a `pnpm-lock.yaml`. If you're contributing, use pnpm to keep the lockfile consistent: `npm i -g pnpm`.

## License

[MIT](LICENSE)
