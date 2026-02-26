import { EventEmitter } from "events";
import { OpenClawClient } from "openclaw-node";
import type { 
  AgentRuntimeClient, 
  RuntimeChatChunk, 
  RuntimeSession, 
  RuntimeHistoryMessage 
} from "@/types/runtime";

/**
 * Adapter for OpenClaw Gateway (Node.js) to conform to Zinchy's unified Runtime API.
 */
export class OpenClawAdapter extends EventEmitter implements AgentRuntimeClient {
  private client: OpenClawClient;

  constructor(options: any) {
    super();
    this.client = new OpenClawClient(options);
    
    // Relay events
    this.client.on("connected", () => this.emit("connected"));
    this.client.on("disconnected", () => this.emit("disconnected"));
    this.client.on("error", (err) => this.emit("error", err));
  }

  get isConnected() {
    return this.client.isConnected;
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async *chat(text: string, options?: Record<string, any>): AsyncIterableIterator<RuntimeChatChunk> {
    const stream = this.client.chat(text, options);
    for await (const chunk of stream) {
      // OpenClaw chunks are already largely compatible, but we map them here for safety
      yield {
        type: chunk.type as any,
        text: chunk.text,
        tool_use: (chunk as any).tool_use,
        tool_result: (chunk as any).tool_result,
      };
    }
  }

  sessions = {
    list: async (): Promise<{ sessions?: RuntimeSession[] }> => {
      const result = await this.client.sessions.list();
      return {
        sessions: (result as any)?.sessions?.map((s: any) => ({ key: s.key })) || []
      };
    },
    history: async (sessionKey: string): Promise<{ messages?: RuntimeHistoryMessage[] }> => {
      const result = await this.client.sessions.history(sessionKey);
      return {
        messages: (result as any)?.messages?.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp
        })) || []
      };
    }
  };

  removeListener(event: string, listener: (...args: any[]) => void): this {
    this.client.removeListener(event, listener);
    return super.removeListener(event, listener);
  }
}
