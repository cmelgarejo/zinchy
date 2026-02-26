import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsPage from "@/app/(app)/settings/page";

let capturedProviderProps: {
  onSuccess?: () => void;
  submitLabel?: string;
  configuredProviders?: Record<string, { configured: boolean }>;
  defaultProvider?: string | null;
} = {};

vi.mock("@/components/provider-key-form", () => ({
  ProviderKeyForm: (props: {
    onSuccess: () => void;
    submitLabel?: string;
    configuredProviders?: Record<string, { configured: boolean }>;
    defaultProvider?: string | null;
  }) => {
    capturedProviderProps = props;
    return (
      <button onClick={props.onSuccess} data-testid="mock-provider-form">
        {props.submitLabel || "Continue"}
      </button>
    );
  },
}));

vi.mock("@/components/settings-users", () => ({
  SettingsUsers: ({ currentUserId }: { currentUserId: string }) => (
    <div data-testid="mock-settings-users">Users (currentUserId: {currentUserId})</div>
  ),
}));

vi.mock("@/components/settings-profile", () => ({
  SettingsProfile: ({ userName }: { userName: string }) => (
    <div data-testid="mock-settings-profile">Profile (userName: {userName})</div>
  ),
}));

const mockUseSession = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

describe("Settings Page", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  const adminSession = {
    data: {
      user: { id: "admin-1", name: "Admin Alice", role: "admin" },
    },
    status: "authenticated",
  };

  const userSession = {
    data: {
      user: { id: "user-1", name: "Regular Bob", role: "user" },
    },
    status: "authenticated",
  };

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch").mockImplementation(vi.fn());
    vi.clearAllMocks();
    capturedProviderProps = {};
    mockUseSession.mockReturnValue(adminSession);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("should render the page title", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        defaultProvider: null,
        providers: {
          anthropic: { configured: false },
          openai: { configured: false },
          google: { configured: false },
        },
      }),
    });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });
  });

  describe("Admin user", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(adminSession);
    });

    it("should render Provider, Users, and Profile tabs", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          defaultProvider: null,
          providers: {
            anthropic: { configured: false },
            openai: { configured: false },
            google: { configured: false },
          },
        }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: "Provider" })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "Users" })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "Profile" })).toBeInTheDocument();
      });
    });

    it("should show Provider tab content by default for admin", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          defaultProvider: null,
          providers: {
            anthropic: { configured: false },
            openai: { configured: false },
            google: { configured: false },
          },
        }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText("LLM Provider")).toBeInTheDocument();
      });
    });

    it("should render LLM Provider section with ProviderKeyForm", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          defaultProvider: null,
          providers: {
            anthropic: { configured: false },
            openai: { configured: false },
            google: { configured: false },
          },
        }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-provider-form")).toBeInTheDocument();
      });
    });

    it("should show loading state while fetching provider status", () => {
      vi.mocked(global.fetch).mockReturnValueOnce(new Promise(() => {}));

      render(<SettingsPage />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should pass configuredProviders and defaultProvider to ProviderKeyForm after fetch", async () => {
      const providerData = {
        defaultProvider: "anthropic",
        providers: {
          anthropic: { configured: true },
          openai: { configured: false },
          google: { configured: false },
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => providerData,
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-provider-form")).toBeInTheDocument();
      });

      expect(capturedProviderProps.configuredProviders).toEqual(providerData.providers);
      expect(capturedProviderProps.defaultProvider).toBe("anthropic");
    });

    it("should re-fetch provider status after onSuccess", async () => {
      const providerData = {
        defaultProvider: "anthropic",
        providers: {
          anthropic: { configured: true },
          openai: { configured: false },
          google: { configured: false },
        },
      };

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => providerData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => providerData,
        });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-provider-form")).toBeInTheDocument();
      });

      capturedProviderProps.onSuccess!();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Regular user", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(userSession);
    });

    it("should only show Profile tab", () => {
      render(<SettingsPage />);

      expect(screen.getByRole("tab", { name: "Profile" })).toBeInTheDocument();
      expect(screen.queryByRole("tab", { name: "Provider" })).not.toBeInTheDocument();
      expect(screen.queryByRole("tab", { name: "Users" })).not.toBeInTheDocument();
    });

    it("should show Profile tab content by default", () => {
      render(<SettingsPage />);

      expect(screen.getByTestId("mock-settings-profile")).toBeInTheDocument();
    });

    it("should not fetch provider status", () => {
      render(<SettingsPage />);

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
