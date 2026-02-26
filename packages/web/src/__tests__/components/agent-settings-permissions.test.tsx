import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { AgentSettingsPermissions } from "@/components/agent-settings-permissions";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("AgentSettingsPermissions", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  const defaultAgent = {
    id: "agent-1",
    name: "Smithers",
    model: "anthropic/claude-sonnet-4-20250514",
    isPersonal: false,
    allowedTools: [] as string[],
    pluginConfig: null as { allowed_paths?: string[] } | null,
  };

  const defaultDirectories = [
    { path: "/data/docs", name: "docs" },
    { path: "/data/reports", name: "reports" },
  ];

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch").mockImplementation(vi.fn());
    vi.clearAllMocks();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("should render Safe Tools heading with checkboxes for safe tools", () => {
    render(<AgentSettingsPermissions agent={defaultAgent} directories={defaultDirectories} />);

    expect(screen.getByText("Safe Tools")).toBeInTheDocument();
    expect(screen.getByLabelText("List approved directories")).toBeInTheDocument();
    expect(screen.getByLabelText("Read approved files")).toBeInTheDocument();
  });

  it("should render Powerful Tools heading with checkboxes for powerful tools", () => {
    render(<AgentSettingsPermissions agent={defaultAgent} directories={defaultDirectories} />);

    expect(screen.getByText("Powerful Tools")).toBeInTheDocument();
    expect(screen.getByLabelText("Run commands")).toBeInTheDocument();
    expect(screen.getByLabelText("Read any file")).toBeInTheDocument();
    expect(screen.getByLabelText("Write files")).toBeInTheDocument();
    expect(screen.getByLabelText("Browse the web")).toBeInTheDocument();
    expect(screen.getByLabelText("Search the web")).toBeInTheDocument();
  });

  it("should show a warning message in the Powerful Tools section", () => {
    render(<AgentSettingsPermissions agent={defaultAgent} directories={defaultDirectories} />);

    expect(
      screen.getByText(/these tools give the agent direct access to your server/i)
    ).toBeInTheDocument();
  });

  it("should show DirectoryPicker when a safe tool is checked", async () => {
    render(<AgentSettingsPermissions agent={defaultAgent} directories={defaultDirectories} />);

    // DirectoryPicker should not be visible initially (no safe tools checked)
    expect(screen.queryByText("Allowed Directories")).not.toBeInTheDocument();

    // Check a safe tool
    await userEvent.click(screen.getByLabelText("List approved directories"));

    // DirectoryPicker should now be visible
    expect(screen.getByText("Allowed Directories")).toBeInTheDocument();
  });

  it("should NOT show DirectoryPicker when no safe tools are checked", () => {
    render(<AgentSettingsPermissions agent={defaultAgent} directories={defaultDirectories} />);

    expect(screen.queryByText("Allowed Directories")).not.toBeInTheDocument();
  });

  it("should show DirectoryPicker when agent already has safe tools allowed", () => {
    const agentWithTools = {
      ...defaultAgent,
      allowedTools: ["zinchy_ls"],
      pluginConfig: { allowed_paths: ["/data/docs"] },
    };

    render(<AgentSettingsPermissions agent={agentWithTools} directories={defaultDirectories} />);

    expect(screen.getByText("Allowed Directories")).toBeInTheDocument();
  });

  it("should call PATCH with allowedTools and pluginConfig on save", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "agent-1" }),
    } as Response);

    const agentWithTools = {
      ...defaultAgent,
      allowedTools: ["zinchy_ls", "shell"],
      pluginConfig: { allowed_paths: ["/data/docs"] },
    };

    render(<AgentSettingsPermissions agent={agentWithTools} directories={defaultDirectories} />);

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/agents/agent-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowedTools: ["zinchy_ls", "shell"],
          pluginConfig: { allowed_paths: ["/data/docs"] },
        }),
      });
    });
  });

  it("should show success toast on successful save", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "agent-1" }),
    } as Response);

    render(<AgentSettingsPermissions agent={defaultAgent} directories={defaultDirectories} />);

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Permissions saved");
    });
  });

  it("should show error toast on failed save", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Forbidden" }),
    } as Response);

    render(<AgentSettingsPermissions agent={defaultAgent} directories={defaultDirectories} />);

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to save permissions");
    });
  });
});
