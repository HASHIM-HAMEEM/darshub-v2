import { describe, expect, it } from "vitest";
import { getContentMaxWidth, getTabListBottomPadding, isTabletLayout } from "../lib/responsive-layout";

describe("DarsHub responsive layout", () => {
  it("keeps phone screens edge-to-edge while applying a readable tablet content frame", () => {
    expect(getContentMaxWidth(390)).toBeUndefined();
    expect(getContentMaxWidth(768)).toBe(720);
    expect(getContentMaxWidth(1024)).toBe(860);
    expect(getContentMaxWidth(1280)).toBe(960);
  });

  it("identifies tablet breakpoints consistently", () => {
    expect(isTabletLayout(767)).toBe(false);
    expect(isTabletLayout(768)).toBe(true);
  });

  it("reserves predictable room above tab navigation across system insets", () => {
    expect(getTabListBottomPadding(0)).toBe(84);
    expect(getTabListBottomPadding(34)).toBe(110);
  });
});
