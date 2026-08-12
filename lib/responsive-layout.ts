export function getContentMaxWidth(width: number): number | undefined {
  if (width >= 1200) return 960;
  if (width >= 1024) return 860;
  if (width >= 768) return 720;
  return undefined;
}

export function isTabletLayout(width: number): boolean {
  return width >= 768;
}

export function getTabListBottomPadding(bottomInset: number): number {
  return 76 + Math.max(bottomInset, 8);
}
