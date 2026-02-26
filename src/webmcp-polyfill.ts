// Dev-only polyfill for navigator.modelContext (W3C WebMCP draft spec).
// Implements the API in-memory and exposes window.__webmcp__ for console testing.
// Only active in development — stripped from production builds.

if (import.meta.env.DEV && !navigator.modelContext) {
  const tools = new Map<string, ModelContextTool>();

  const modelContext: ModelContext = {
    provideContext(options = {}) {
      tools.clear();
      for (const tool of options.tools ?? []) {
        tools.set(tool.name, tool);
      }
    },
    clearContext() {
      tools.clear();
    },
    registerTool(tool) {
      if (tools.has(tool.name)) {
        throw new Error(`[WebMCP] Tool "${tool.name}" is already registered.`);
      }
      tools.set(tool.name, tool);
    },
    unregisterTool(name) {
      tools.delete(name);
    },
  };

  Object.defineProperty(navigator, "modelContext", {
    value: modelContext,
    writable: false,
    configurable: false,
  });

  // Dev helper exposed on window for browser console testing
  const client: ModelContextClient = {
    async requestUserInteraction(callback) {
      return callback();
    },
  };

  (window as unknown as Record<string, unknown>).__webmcp__ = {
    /** List all registered tools */
    list() {
      const entries = [...tools.entries()].map(([name, tool]) => ({
        name,
        description: tool.description,
        readOnlyHint: tool.annotations?.readOnlyHint ?? false,
      }));
      console.table(entries);
      return entries;
    },

    /** Call a tool by name with an input object */
    async call(name: string, input: Record<string, unknown> = {}) {
      const tool = tools.get(name);
      if (!tool) {
        console.error(`[WebMCP] No tool named "${name}". Run __webmcp__.list() to see available tools.`);
        return;
      }
      console.info(`[WebMCP] Calling "${name}" with:`, input);
      const result = await tool.execute(input, client);
      console.info(`[WebMCP] Result:`, result);
      return result;
    },

    /** Show full inputSchema for a tool */
    schema(name: string) {
      const tool = tools.get(name);
      if (!tool) {
        console.error(`[WebMCP] No tool named "${name}".`);
        return;
      }
      console.info(`[WebMCP] Schema for "${name}":`, tool.inputSchema);
      return tool.inputSchema;
    },
  };

  console.info(
    "%c[WebMCP] Dev polyfill active. Try:\n" +
    "  __webmcp__.list()  — list tools\n" +
    "  __webmcp__.call('calculatePrintQuality', { imageWidth: 4096, imageHeight: 5120, printWidthInches: 16, printHeightInches: 20 })\n" +
    "  __webmcp__.schema('calculatePrintQuality')",
    "color: #38bdf8; font-family: monospace;"
  );
}
