export interface RuntimeChatChunk {
  type: "text" | "tool_use" | "tool_result" | "error" | "done";
  text?: string;
  tool_use?: any;
  tool_result?: any;
}

export interface RuntimeSession {
  key: string;
}

export interface RuntimeHistoryMessage {
  role: string;
  content: string | any[];
  timestamp?: number;
}

export interface AgentRuntimeClient {
  isConnected: boolean;
  chat(text: string, options?: Record<string, any>): AsyncIterableIterator<RuntimeChatChunk>;
  sessions: {
    list(): Promise<{ sessions?: RuntimeSession[] }>;
    history(sessionKey: string): Promise<{ messages?: RuntimeHistoryMessage[] }>;
  };
  on(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
  removeListener(event: string, listener: (...args: any[]) => void): this;
  connect(): Promise<void>;
}
