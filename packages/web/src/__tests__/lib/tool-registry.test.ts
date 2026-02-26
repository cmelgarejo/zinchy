import { describe, it, expect } from "vitest";
import {
  TOOL_REGISTRY,
  getToolById,
  getToolsByCategory,
  computeDeniedGroups,
} from "@/lib/tool-registry";

describe("TOOL_REGISTRY", () => {
  it("contains safe tools", () => {
    const safe = TOOL_REGISTRY.filter((t) => t.category === "safe");
    expect(safe.length).toBeGreaterThanOrEqual(2);
    expect(safe.map((t) => t.id)).toContain("zinchy_ls");
    expect(safe.map((t) => t.id)).toContain("zinchy_read");
  });

  it("contains powerful tools", () => {
    const powerful = TOOL_REGISTRY.filter((t) => t.category === "powerful");
    expect(powerful.length).toBeGreaterThanOrEqual(5);
  });

  it("every tool has id, label, description, and category", () => {
    for (const tool of TOOL_REGISTRY) {
      expect(tool.id).toBeTruthy();
      expect(tool.label).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(["safe", "powerful"]).toContain(tool.category);
    }
  });

  it("has unique tool IDs", () => {
    const ids = TOOL_REGISTRY.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getToolById", () => {
  it("returns a tool by ID", () => {
    const tool = getToolById("zinchy_ls");
    expect(tool?.label).toBe("List approved directories");
  });

  it("returns undefined for unknown ID", () => {
    expect(getToolById("nonexistent")).toBeUndefined();
  });
});

describe("getToolsByCategory", () => {
  it("returns only safe tools", () => {
    const safe = getToolsByCategory("safe");
    expect(safe.every((t) => t.category === "safe")).toBe(true);
  });

  it("returns only powerful tools", () => {
    const powerful = getToolsByCategory("powerful");
    expect(powerful.every((t) => t.category === "powerful")).toBe(true);
  });
});

describe("computeDeniedGroups", () => {
  it("returns empty deny list when no tools are allowed", () => {
    const denied = computeDeniedGroups([]);
    expect(denied).toContain("group:runtime");
    expect(denied).toContain("group:fs");
    expect(denied).toContain("group:web");
  });

  it("removes group from deny list when a tool from that group is allowed", () => {
    const denied = computeDeniedGroups(["shell"]);
    expect(denied).not.toContain("group:runtime");
    expect(denied).toContain("group:fs");
    expect(denied).toContain("group:web");
  });

  it("removes fs group when any fs tool is allowed", () => {
    const denied = computeDeniedGroups(["fs_read"]);
    expect(denied).not.toContain("group:fs");
  });

  it("ignores safe tools for group computation", () => {
    const denied = computeDeniedGroups(["zinchy_ls", "zinchy_read"]);
    expect(denied).toContain("group:runtime");
    expect(denied).toContain("group:fs");
    expect(denied).toContain("group:web");
  });
});
