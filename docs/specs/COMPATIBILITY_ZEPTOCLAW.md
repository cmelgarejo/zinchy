# ZeptoClaw Compatibility & Migration Report

This document analyzes the feasibility of replacing **OpenClaw** with **ZeptoClaw** as the core agent runtime for **Zinchy**.

## Executive Summary

ZeptoClaw is a Rust-based, ultra-lightweight agent runtime designed for speed and portability. While it is highly compatible with OpenClaw's **skills** (metadata format), it lacks a direct equivalent to the **OpenClaw Gateway WebSocket API**, which Zinchy currently uses to provide multi-user, multi-tenant agent orchestration.

Replacing OpenClaw with ZeptoClaw is **feasible** but requires significant development work to bridge the gap between Zinchy's enterprise multi-user layer and ZeptoClaw's personal-assistant-oriented API.

---

## Capability Comparison

| Feature | OpenClaw | ZeptoClaw | Compatibility Status |
| :--- | :--- | :--- | :--- |
| **Language** | Node.js (TypeScript) | Rust | Structural difference |
| **Skills / Tools** | Custom JS/TS Plugins | Markdown-based (compat with OC) | **High** (ZeptoClaw supports OC metadata) |
| **API Protocol** | JSON-RPC over WebSocket | REST + Event streaming (WS) | **Medium** (Needs custom bridge) |
| **Multi-tenancy** | Native (Gateway/Client model) | Single-instance oriented | **Gap** (Zinchy must handle all multi-tenancy) |
| **Streaming** | Native streaming support | Native streaming (Panel API) | **High** |
| **State Management** | Centralized in Gateway | Local (File/Memory/Redis) | **High** (OC -> Zepto migration available) |
| **Resource Usage** | Moderate (~200MB+ RAM) | Very Low (< 10MB RAM) | **Improvement** (Significant win) |

---

## Identified Gaps & Challenges

### 1. WebSocket Protocol Mismatch
Zinchy's `ClientRouter` and `openclaw-node` client expect an OpenClaw Gateway WebSocket connection. ZeptoClaw's WebSocket (`/ws/events`) is designed for a dashboard (Panel) to observe events, not to facilitate a bi-directional chat interaction between a multi-user frontend and a central runtime.

**Solution:** Zinchy will need a custom `ZeptoClawClient` in the web package that uses ZeptoClaw's REST API (`POST /api/messages` or similar, to be implemented/exposed) and listens to the event stream.

### 2. Multi-user Orchestration
In the current architecture, OpenClaw Gateway handles multiple agents and sessions. ZeptoClaw is designed to be a single agent process.

**Solution:** Zinchy must transition from a "Client-to-Gateway" model to a "Zinchy-as-Orchestrator" model. Zinchy would spawn or manage individual ZeptoClaw instances (or one multi-session instance) and handle the routing itself.

### 3. Missing Chat API in ZeptoClaw
ZeptoClaw's API (as of research) focuses on Panel management (sessions, tasks, health). It lacks a direct "Chat" endpoint equivalent to OpenClaw's `chat` method.

**Solution:** Expose the `AgentLoop::process_message` logic via a new REST/WebSocket endpoint in ZeptoClaw's `src/api`.

---

## Roadmap

### Phase 1: Prototype Bridge (Short Term)
- [ ] Add a "Direct Agent API" to ZeptoClaw to allow REST-based chat interactions.
- [ ] Implement a `ZeptoClawClient` in Zinchy (`packages/web/src/lib/zeptoclaw-client.ts`).
- [ ] Update `ClientRouter` to support either OpenClaw or ZeptoClaw via an abstraction layer.

### Phase 2: Native Integration (Medium Term)
- [ ] Replace `Dockerfile.openclaw` with a ZeptoClaw-based runtime image.
- [ ] Migrate `zinchy-files` plugin to ZeptoClaw's skill format (should be near-automatic).
- [ ] Implement multi-tenant session routing inside Zinchy's backend.

### Phase 3: Optimization (Long Term)
- [ ] Leverge ZeptoClaw's Rust execution for hardware/OS-level tools that were slow in Node.js.
- [ ] Fully remove `openclaw-node` dependency.

---

## Conclusion
ZeptoClaw is the superior choice for Zinchy's long-term goal of being a lightweight, high-performance enterprise agent platform. The primary hurdle is the **missing multi-user gateway protocol**, which Zinchy is already well-positioned to implement as it already handles authentication and RBAC.
