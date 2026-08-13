import { describe, expect, it } from "vitest";
import { createDarsHubExport, stringifyDarsHubExport } from "../lib/export-format";
import { defaultPreferences, type StoredStudySpace } from "../lib/dars-storage";

const space: StoredStudySpace = { classes: [], teachers: [], books: [], locations: [], preferences: defaultPreferences };

describe("DarsHub export format", () => {
  it("creates a versioned, portable local-only payload", () => {
    const output = createDarsHubExport(space, "2026-08-13T12:00:00.000Z");
    expect(output).toMatchObject({ format: "darshub-local-export", version: 1, exportedAt: "2026-08-13T12:00:00.000Z", data: space });
    expect(JSON.parse(stringifyDarsHubExport(space, "2026-08-13T12:00:00.000Z"))).toEqual(output);
  });
});
