import { describe, expect, it } from "vitest";
import { applyRestore, parseDarsHubImport, summarizeRestore } from "../lib/data-import";
import { defaultPreferences, type StoredStudySpace } from "../lib/dars-storage";
import { stringifyDarsHubExport } from "../lib/export-format";

const current: StoredStudySpace = { classes: [{ id: "class-1" } as StoredStudySpace["classes"][number]], teachers: [{ id: "teacher-1" } as StoredStudySpace["teachers"][number]], books: [], locations: [], preferences: defaultPreferences };
const incoming: StoredStudySpace = { classes: [{ id: "class-1" } as StoredStudySpace["classes"][number], { id: "class-2" } as StoredStudySpace["classes"][number]], teachers: [], books: [{ id: "book-1" } as StoredStudySpace["books"][number]], locations: [], preferences: { ...defaultPreferences, appLanguage: "ar" } };

describe("DarsHub local restore", () => {
  it("validates the versioned local format and previews conflicts", () => {
    expect(parseDarsHubImport(stringifyDarsHubExport(incoming)).data).toEqual(incoming);
    expect(summarizeRestore(current, incoming).conflicts).toMatchObject({ classes: 1, teachers: 0, books: 0, locations: 0 });
    expect(() => parseDarsHubImport("{}")) .toThrow("invalid-darshub-export");
  });
  it("merges non-conflicting records safely or replaces on explicit selection", () => {
    expect(applyRestore(current, incoming, "merge").space.classes.map((item) => item.id)).toEqual(["class-1", "class-2"]);
    expect(applyRestore(current, incoming, "merge").space.preferences.appLanguage).toBe("ar");
    expect(applyRestore(current, incoming, "replace").space).toEqual(incoming);
  });
});
