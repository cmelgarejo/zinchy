import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, type WebSocket } from "ws";
import { ClientRouter } from "./src/server/client-router";
import { SessionCache } from "./src/server/session-cache";
import { validateWsSession } from "./src/server/ws-auth";
import { restartState } from "./src/server/restart-state";
import { createRuntimeClient } from "./src/lib/runtime-factory";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

if (process.env.NODE_ENV === "production") {
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl.includes(":zinchy_dev@")) {
    console.warn(
      "WARNING: Using default DB_PASSWORD. Set a secure password via .env for production."
    );
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url!, true));
  });

  const runtimeClient = createRuntimeClient();

  if (runtimeClient) {
    runtimeClient.connect().catch((err) => {
      console.error("Agent runtime initial connection failed, will retry:", err.message);
    });

    runtimeClient.on("connected", () => {
      console.log("Connected to Agent Runtime");
      if (restartState.isRestarting) {
        restartState.notifyReady();
      }
    });

    runtimeClient.on("disconnected", () => {
      console.log("Disconnected from Agent Runtime, reconnecting...");
    });

    runtimeClient.on("error", (err: any) => {
      console.error("Agent runtime client error:", err.message);
    });
  } else {
    console.log("No agent runtime configured (OPENCLAW_WS_URL or ZEPTOCLAW_API_URL missing)");
  }

  const sessionCache = new SessionCache();

  const wss = new WebSocketServer({ noServer: true, maxPayload: 1 * 1024 * 1024 });
  const sessionMap = new Map<WebSocket, { userId: string; userRole: string }>();

  function broadcastToClients(message: Record<string, unknown>) {
    const payload = JSON.stringify(message);
    for (const [clientWs] of sessionMap) {
      if (clientWs.readyState === 1) clientWs.send(payload);
    }
  }

  restartState.on("restarting", () => broadcastToClients({ type: "runtime:restarting" }));
  restartState.on("ready", () => broadcastToClients({ type: "runtime:ready" }));

  server.on("upgrade", async (request, socket, head) => {
    const { pathname } = parse(request.url!, true);
    if (pathname === "/api/ws") {
      const session = await validateWsSession(request.headers.cookie);
      if (!session) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }
      wss.handleUpgrade(request, socket, head, (ws) => {
        sessionMap.set(ws, {
          userId: (session.sub as string) || (session.id as string),
          userRole: (session.role as string) || "user",
        });
        wss.emit("connection", ws, request);
      });
    }
    // Other upgrade requests (e.g. Next.js HMR) are left for Next.js to handle
  });

  wss.on("connection", (clientWs) => {
    const sessionInfo = sessionMap.get(clientWs);
    if (!sessionInfo) return;

    const router = runtimeClient
      ? new ClientRouter(runtimeClient, sessionInfo.userId, sessionInfo.userRole, sessionCache)
      : null;

    clientWs.on("message", (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (!router) {
          clientWs.send(JSON.stringify({ type: "error", message: "Agent runtime not configured" }));
          return;
        }
        router.handleMessage(clientWs, parsed).catch((err) => {
          console.error("Unhandled router error:", err instanceof Error ? err.message : err);
        });
      } catch {
        // Ignore unparseable messages
      }
    });

    clientWs.on("close", () => {
      sessionMap.delete(clientWs);
    });

    clientWs.on("error", (err) => {
      console.error("Client WebSocket error:", err.message);
      sessionMap.delete(clientWs);
    });
  });

  const port = parseInt(process.env.PORT || "7777", 10);
  server.listen(port, () => {
    console.log(`Zinchy ready on http://localhost:${port}`);
  });
});


  const port = parseInt(process.env.PORT || "7777", 10);
  server.listen(port, () => {
    console.log(`Zinchy ready on http://localhost:${port}`);
  });
});
