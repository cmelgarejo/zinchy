import { OpenClawAdapter } from "./openclaw-adapter";
import { ZeptoClawClient } from "./zeptoclaw-client";
import type { AgentRuntimeClient } from "@/types/runtime";

export function createRuntimeClient(): AgentRuntimeClient | null {
  const openclawUrl = process.env.OPENCLAW_WS_URL;
  const zeptoclawUrl = process.env.ZEPTOCLAW_API_URL;

  if (zeptoclawUrl) {
    console.log("Using ZeptoClaw runtime at", zeptoclawUrl);
    return new ZeptoClawClient({ url: zeptoclawUrl });
  }

  if (openclawUrl) {
    console.log("Using OpenClaw runtime at", openclawUrl);
    return new OpenClawAdapter({
      url: openclawUrl,
      token: readGatewayToken(),
      clientId: "gateway-client",
      clientVersion: "0.1.0",
      scopes: ["operator.admin"],
      deviceIdentityPath: process.env.DEVICE_IDENTITY_PATH || "/app/secrets/device-identity.json",
      autoReconnect: true,
      reconnectIntervalMs: 1000,
      maxReconnectAttempts: Infinity,
    });
  }

  return null;
}


function readGatewayToken(): string {
  try {
    const fs = require("fs");
    const OPENCLAW_CONFIG_PATH = process.env.OPENCLAW_CONFIG_PATH || "/openclaw-config/openclaw.json";
    const config = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG_PATH, "utf-8"));
    return config.gateway?.auth?.token ?? "";
  } catch {
    return "";
  }
}
