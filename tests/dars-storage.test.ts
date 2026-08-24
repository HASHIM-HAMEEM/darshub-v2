import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => {
  const values = new Map<string, string>();
  const multiGet = vi.fn(async (keys: readonly string[]) => keys.map((key) => [key, values.get(key) ?? null] as [string, string | null]));
  const multiSet = vi.fn(async (entries: readonly [string, string][]) => { entries.forEach(([key, value]) => values.set(key, value)); });
  return { values, multiGet, multiSet };
});
vi.mock("@react-native-async-storage/async-storage", () => ({ default: { multiGet: storage.multiGet, multiSet: storage.multiSet } }));

import { createSerializedTaskQueue, defaultPreferences, loadStudySpace, saveStudySpace } from "../lib/dars-storage";

describe("Dars local persistence", () => {
  beforeEach(() => { storage.values.clear(); storage.multiGet.mockClear(); storage.multiSet.mockClear(); });

  it("uses an empty, safe study space when no prior local records exist", async () => {
    await expect(loadStudySpace()).resolves.toEqual({ classes: [], teachers: [], books: [], locations: [], preferences: defaultPreferences });
  });

  it("saves each study record group and merges missing preference defaults on reload", async () => {
    await saveStudySpace({ classes: [], teachers: [{ id: "teacher-1", name: "Shaykh", subjects: [] }], books: [], locations: [], preferences: { ...defaultPreferences, appLanguage: "ar" } });
    storage.values.set("darshub:preferences", JSON.stringify({ remindersEnabled: true }));
    const space = await loadStudySpace();
    expect(storage.multiSet).toHaveBeenCalledOnce();
    expect(space.teachers[0]?.name).toBe("Shaykh");
    expect(space.preferences).toMatchObject({ appLanguage: "en", remindersEnabled: true, dateLanguage: "en" });
  });

  it("recovers safely from malformed persisted values", async () => {
    storage.values.set("darshub:classes", "not-json");
    await expect(loadStudySpace()).resolves.toMatchObject({ classes: [], preferences: defaultPreferences });
  });

  it("serializes writes so an older snapshot cannot finish after a newer snapshot", async () => {
    const queue = createSerializedTaskQueue(); const order: string[] = []; let releaseFirst: (() => void) | undefined;
    const first = queue.run(async () => { order.push("first-start"); await new Promise<void>((resolve) => { releaseFirst = resolve; }); order.push("first-end"); });
    const second = queue.run(async () => { order.push("second"); });
    await Promise.resolve();
    expect(order).toEqual(["first-start"]);
    releaseFirst?.(); await Promise.all([first, second]);
    expect(order).toEqual(["first-start", "first-end", "second"]);
  });
});
