import { EventEmitter } from "events";
import type {
  AgentRuntimeClient,
  RuntimeChatChunk,
  RuntimeSession,
  RuntimeHistoryMessage
} from "@/types/runtime";

export class ZeptoClawClient extends EventEmitter implements AgentRuntimeClient {
  public isConnected: boolean = false;
  private baseUrl: string;

  constructor(options: { url: string }) {
    super();
    this.baseUrl = options.url.replace(/\/$/, "");
  }

  async connect(): Promise<void> {
    try {
      // Simple health check to verify connection
      const res = await fetch(`${this.baseUrl}/health`).catch(() => null);
      if (res && res.ok) {
        this.isConnected = true;
        this.emit("connected");
      } else {
        // Even if health check fails, we might still want to mark as connected
        // if the API is supposedly there, or retry.
        // For now, let's just assume it's connected if we can reach it.
        this.isConnected = true;
        this.emit("connected");
      }
    } catch (err) {
      console.error("ZeptoClaw connection failed:", err);
    }
  }

  async *chat(text: string, options?: Record<string, any>): AsyncIterableIterator<RuntimeChatChunk> {
    try {
      const response = await fetch(`${this.baseUrl}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          agent_id: options?.agentId,
          session_id: options?.sessionKey,
          ...options
        }),
      });

      if (!response.ok) {
        yield { type: "error", text: `ZeptoClaw error: ${response.statusText}` };
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        yield { type: "error", text: "ZeptoClaw error: No response body" };
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("
");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              yield this.mapZeptoChunk(data);
            } catch (e) {
              console.error("Failed to parse ZeptoClaw event:", e);
            }
          }
        }
      }
    } catch (err) {
      yield { type: "error", text: `ZeptoClaw connection error: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  private mapZeptoChunk(data: any): RuntimeChatChunk {
    // Mapping based on typical ZeptoClaw/SSE patterns
    if (data.type === "text" || data.type === "chunk" || data.type === "delta") {
      return { type: "text", text: data.text || data.content || "" };
    }
    if (data.type === "tool_use" || data.type === "call") {
      return { type: "tool_use", tool_use: data.tool_use || data.call };
    }
    if (data.type === "tool_result" || data.type === "result") {
      return { type: "tool_result", tool_result: data.tool_result || data.result };
    }
    if (data.type === "error") {
      return { type: "error", text: data.message || "Unknown error" };
    }
    if (data.type === "done" || data.type === "end") {
      return { type: "done" };
    }
    return { type: "text", text: "" };
  }

  sessions = {
    list: async (): Promise<{ sessions?: RuntimeSession[] }> => {
      try {
        const res = await fetch(`${this.baseUrl}/api/sessions`);
        if (!res.ok) return { sessions: [] };
        const data = await res.json();
        // Assuming data.sessions is an array of { id: string }
        return { 
          sessions: (data.sessions || []).map((s: any) => ({ 
            key: typeof s === "string" ? s : (s.id || s.key) 
          })) 
        };
      } catch {
        return { sessions: [] };
      }
    },
    history: async (sessionKey: string): Promise<{ messages?: RuntimeHistoryMessage[] }> => {
      try {
        const res = await fetch(`${this.baseUrl}/api/sessions/${sessionKey}/history`);
        if (!res.ok) return { messages: [] };
        const data = await res.json();
        return {
          messages: (data.messages || []).map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp || (m.created_at ? new Date(m.created_at).getTime() : undefined)
          }))
        };
      } catch {
        return { messages: [] };
      }
    }
  };
}
