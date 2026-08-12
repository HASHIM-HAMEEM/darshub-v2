function channel(value: string): number {
  const normalized = Number.parseInt(value, 16) / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    const value = hex.replace("#", "");
    const [red, green, blue] = [value.slice(0, 2), value.slice(2, 4), value.slice(4, 6)].map(channel);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}
