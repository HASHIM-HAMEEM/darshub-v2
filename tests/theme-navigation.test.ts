import { describe, expect, it } from "vitest";
import { contrastRatio } from "../lib/color-contrast";
import { resolveBackAction } from "../lib/navigation-utils";

const mobilePalettes = {
  light: { text: "#2D3A3A", background: "#F5F3EF", tint: "#2E6E5E", wash: "#E8F0ED", onPrimary: "#FFFFFF" },
  dark: { text: "#F1F5F1", background: "#17211F", tint: "#8FC7B7", wash: "#2C403A", onPrimary: "#10231E" },
};

describe("DarsHub theme and navigation", () => {
  it("keeps text, accent icons, and on-primary button content legible in both themes", () => {
    Object.values(mobilePalettes).forEach((palette) => {
      expect(contrastRatio(palette.text, palette.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(palette.tint, palette.wash)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(palette.onPrimary, palette.tint)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it("uses a reliable home fallback when a detail page has no history", () => {
    expect(resolveBackAction(true)).toBe("back");
    expect(resolveBackAction(false)).toBe("home");
  });
});
