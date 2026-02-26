import { describe, it, expect, vi } from "vitest";
import { ZeptoClawClient } from "@/lib/zeptoclaw-client";
import { OpenClawAdapter } from "@/lib/openclaw-adapter";

// Mock openclaw-node since it might not be in the environment
vi.mock("openclaw-node", () => {
  return {
    OpenClawClient: class {
      on = vi.fn();
      chat = vi.fn();
      sessions = {
        list: vi.fn(),
        history: vi.fn(),
      };
      connect = vi.fn();
      isConnected = true;
    }
  };
});

// Mock fetch for ZeptoClaw
global.fetch = vi.fn();

describe("Runtime API Parity", () => {
  it("ZeptoClawClient should map REST events to RuntimeChatChunks", async () => {
    const client = new ZeptoClawClient({ url: "http://localhost:8080" });
    
    const mockResponse = {
      body: {
        getReader: () => {
          let sent = false;
          return {
            read: async () => {
              if (sent) return { done: true };
              sent = true;
              return { 
                value: new TextEncoder().encode('data: {"type": "text", "text": "Hello from Zepto"}
'),
                done: false 
              };
            }
          };
        }
      },
      ok: true
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);

    const stream = client.chat("Hi");
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks[0]).toEqual({ type: "text", text: "Hello from Zepto" });
  });

  it("OpenClawAdapter should map WebSocket chunks to RuntimeChatChunks", async () => {
    const { OpenClawClient } = await import("openclaw-node");
    const adapter = new OpenClawAdapter({ url: "ws://localhost:18789" });
    
    const mockStream = (async function* () {
      yield { type: "text", text: "Hello from OpenClaw" };
    })();
    
    (OpenClawClient.prototype.chat as any).mockReturnValue(mockStream);

    const stream = adapter.chat("Hi");
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks[0]).toEqual({ type: "text", text: "Hello from OpenClaw" });
  });
});
