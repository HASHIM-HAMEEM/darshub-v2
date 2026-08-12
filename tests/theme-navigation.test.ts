import { describe, expect, it } from "vitest";
import { contrastRatio } from "../lib/color-contrast";
import { resolveBackAction } from "../lib/navigation-utils";

const palettes = {
  light: { text: "#183C30", background: "#FAF8F1", tint: "#164D3D" },
  dark: { text: "#F0F5EF", background: "#101714", tint: "#86C5A3" },
};

describe("DarsHub theme and navigation", () => {
  it("keeps primary text and primary actions legible in both themes", () => {
    Object.values(palettes).forEach((palette) => {
      expect(contrastRatio(palette.text, palette.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(palette.tint, palette.background)).toBeGreaterThanOrEqual(3);
    });
  });

  it("uses a reliable home fallback when a detail page has no history", () => {
    expect(resolveBackAction(true)).toBe("back");
    expect(resolveBackAction(false)).toBe("home");
  });
});
