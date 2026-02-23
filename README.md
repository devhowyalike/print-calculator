# Print Calculator

A tool for photographers and designers to determine which print sizes their images can support at a given quality level.

![Print Calculator screenshot](public/print-screenshot.png)

Enter your image's pixel dimensions and choose a target PPI — the calculator evaluates 15 common print sizes (4×6" through 36×48") and rates each one as **Excellent**, **Good**, **Marginal**, or **Too Low** based on the effective resolution your file achieves.

It also shows the perceptual minimum PPI for each size (based on typical viewing distance), so you can see when a print will look sharp in practice even if it falls below your technical target.

## Features

- Instant quality ratings across 15 standard print sizes
- Considers both landscape and portrait orientations
- Perceptual min-PPI threshold per size (1-arcminute visual acuity at 1.5× diagonal)
- Summary cards: printable count, largest excellent size, max PPI at that size
- PPI vs DPI explainer section

## Stack

- [TanStack Start](https://tanstack.com/start) — React full-stack framework
- [TanStack Router](https://tanstack.com/router) — file-based routing
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [shadcn/ui](https://ui.shadcn.com/) — component library
- [Vite](https://vitejs.dev/) — build tool

## Getting Started

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`.

## Build

```bash
pnpm build
pnpm preview
```

## Testing

```bash
pnpm test
```

Tests use [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/).

## Adding shadcn Components

```bash
pnpm dlx shadcn@latest add button
```

## Adding Routes

Drop a new file into `src/routes/` — TanStack Router picks it up automatically via file-based routing. The root layout lives in `src/routes/__root.tsx`.
