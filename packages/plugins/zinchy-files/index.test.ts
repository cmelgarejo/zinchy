import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRegisterTool = vi.fn();

function createMockApi(agentConfigs: Record<string, { allowed_paths: string[] }>) {
  return {
    id: "zinchy-files",
    name: "Zinchy Files",
    source: "test",
    config: {},
    pluginConfig: { agents: agentConfigs },
    runtime: {},
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    registerTool: mockRegisterTool,
    registerHook: vi.fn(),
    registerHttpHandler: vi.fn(),
    registerHttpRoute: vi.fn(),
    registerChannel: vi.fn(),
    registerGatewayMethod: vi.fn(),
    registerCli: vi.fn(),
    registerService: vi.fn(),
    registerProvider: vi.fn(),
    registerCommand: vi.fn(),
    resolvePath: vi.fn((p: string) => p),
    on: vi.fn(),
  };
}

describe("zinchy-files plugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers zinchy_ls and zinchy_read as tool factories", async () => {
    const api = createMockApi({ "test-agent": { allowed_paths: ["/data/test-docs/"] } });
    const { default: plugin } = await import("./index");
    plugin.register!(api as any);

    expect(mockRegisterTool).toHaveBeenCalledTimes(2);
  });

  it("registers tool factories (functions), not static tools", async () => {
    const api = createMockApi({ "test-agent": { allowed_paths: ["/data/test-docs/"] } });
    const { default: plugin } = await import("./index");
    plugin.register!(api as any);

    // Both calls should pass a factory function as first arg
    for (const call of mockRegisterTool.mock.calls) {
      expect(typeof call[0]).toBe("function");
    }
  });

  it("zinchy_ls factory returns tool for configured agents", async () => {
    const api = createMockApi({ "agent-1": { allowed_paths: ["/data/docs/"] } });
    const { default: plugin } = await import("./index");
    plugin.register!(api as any);

    const lsFactory = mockRegisterTool.mock.calls.find(
      (call: any[]) => call[1]?.name === "zinchy_ls"
    )?.[0];
    expect(lsFactory).toBeDefined();

    const tool = lsFactory({ agentId: "agent-1" });
    expect(tool).not.toBeNull();
    expect(tool.name).toBe("zinchy_ls");
    expect(tool.label).toBe("List Files");
    expect(tool.description).toContain("/data/docs/");
  });

  it("zinchy_ls factory returns null for unconfigured agents", async () => {
    const api = createMockApi({ "agent-1": { allowed_paths: ["/data/docs/"] } });
    const { default: plugin } = await import("./index");
    plugin.register!(api as any);

    const lsFactory = mockRegisterTool.mock.calls.find(
      (call: any[]) => call[1]?.name === "zinchy_ls"
    )?.[0];

    const tool = lsFactory({ agentId: "unknown-agent" });
    expect(tool).toBeNull();
  });

  it("zinchy_read factory returns tool for configured agents", async () => {
    const api = createMockApi({ "agent-1": { allowed_paths: ["/data/docs/"] } });
    const { default: plugin } = await import("./index");
    plugin.register!(api as any);

    const readFactory = mockRegisterTool.mock.calls.find(
      (call: any[]) => call[1]?.name === "zinchy_read"
    )?.[0];
    expect(readFactory).toBeDefined();

    const tool = readFactory({ agentId: "agent-1" });
    expect(tool).not.toBeNull();
    expect(tool.name).toBe("zinchy_read");
    expect(tool.label).toBe("Read File");
    expect(tool.description).toContain("/data/docs/");
  });

  it("zinchy_read factory returns null for unconfigured agents", async () => {
    const api = createMockApi({ "agent-1": { allowed_paths: ["/data/docs/"] } });
    const { default: plugin } = await import("./index");
    plugin.register!(api as any);

    const readFactory = mockRegisterTool.mock.calls.find(
      (call: any[]) => call[1]?.name === "zinchy_read"
    )?.[0];

    const tool = readFactory({ agentId: "other-agent" });
    expect(tool).toBeNull();
  });

  it("exports a plugin definition with id and configSchema", async () => {
    const { default: plugin } = await import("./index");
    expect(plugin.id).toBe("zinchy-files");
    expect(plugin.name).toBe("Zinchy Files");
    expect(plugin.configSchema).toBeDefined();
  });
});
