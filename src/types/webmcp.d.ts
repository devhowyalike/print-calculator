// Type declarations for the W3C WebMCP Draft Spec
// https://webmachinelearning.github.io/webmcp/

interface ToolAnnotations {
  readOnlyHint?: boolean;
}

interface ModelContextClient {
  requestUserInteraction(callback: UserInteractionCallback): Promise<unknown>;
}

type ToolExecuteCallback = (
  input: Record<string, unknown>,
  client: ModelContextClient
) => Promise<unknown>;

interface ModelContextTool {
  name: string;
  description: string;
  inputSchema?: object;
  execute: ToolExecuteCallback;
  annotations?: ToolAnnotations;
}

interface ModelContextOptions {
  tools?: ModelContextTool[];
}

interface ModelContext {
  provideContext(options?: ModelContextOptions): undefined;
  clearContext(): undefined;
  registerTool(tool: ModelContextTool): undefined;
  unregisterTool(name: string): undefined;
}

type UserInteractionCallback = () => Promise<unknown>;

interface Navigator {
  readonly modelContext?: ModelContext;
}
