import PrintCalculator from "./components/PrintCalculator";
import PPIExplainer from "./components/PPIExplainer";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-200 px-4 sm:px-6 py-14">
      <div className="mx-auto max-w-[920px]">
        <PrintCalculator />

        <PPIExplainer />

        {/* Resources */}
        <div className="mt-12 rounded-2xl border border-white/6 bg-app-card-surface px-6 py-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-zinc-500 shadow-[0_0_6px_rgba(161,161,170,0.3)]" />
            <span className="font-mono text-xs uppercase tracking-[1.5px] text-zinc-500">
              Resources
            </span>
          </div>
          <ul className="m-0 list-none space-y-2 p-0">
            <li>
              <a
                href="https://www.youtube.com/watch?v=6OxoqkZwmmk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition-colors hover:text-zinc-200"
              >
                "How many pixels per inch do you need to make large prints?" by
                Simon d'Entremont
              </a>
            </li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-lg leading-relaxed text-white">
          <span className="mr-2">⚠️</span>Quality ratings are based on
          perceptual heuristics (viewing distance, visual acuity estimates) and
          are intended as a practical guide, not a definitive standard.
          Calculations may be inaccurate. Results may vary depending on the
          printer, paper, viewing conditions, and individual perception. Use at
          your own risk.
        </p>

        {/* Footer */}
        <div className="mt-6 mb-2 flex items-center justify-center gap-4">
          <span className="font-mono text-xs text-zinc-600">
            Made by Yameen
          </span>
          <span className="text-zinc-800">·</span>
          <a
            href="https://github.com/devhowyalike/print-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-600 transition-colors hover:text-zinc-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="font-mono text-xs">devhowyalike</span>
          </a>
        </div>
      </div>
    </div>
  );
}
