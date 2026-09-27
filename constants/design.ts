import { Platform, StyleSheet, type TextStyle } from "react-native";

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, gutter: 20 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;

export const hairline = StyleSheet.hairlineWidth;

export const touchTarget = 48;

const sans = Platform.select({ android: "sans-serif", default: undefined });
const sansMedium = Platform.select({ android: "sans-serif-medium", default: undefined });

export const type = {
  display: { fontFamily: sansMedium, fontSize: 30, fontWeight: "700", letterSpacing: -0.6, lineHeight: 36 },
  title: { fontFamily: sansMedium, fontSize: 22, fontWeight: "700", letterSpacing: -0.3, lineHeight: 28 },
  headline: { fontFamily: sansMedium, fontSize: 17, fontWeight: "600", letterSpacing: -0.1, lineHeight: 22 },
  body: { fontFamily: sans, fontSize: 15, fontWeight: "400", lineHeight: 21 },
  bodyStrong: { fontFamily: sansMedium, fontSize: 15, fontWeight: "600", lineHeight: 21 },
  meta: { fontFamily: sans, fontSize: 13, fontWeight: "400", lineHeight: 18 },
  label: { fontFamily: sansMedium, fontSize: 13, fontWeight: "600", letterSpacing: 0.1, lineHeight: 18 },
  caption: { fontFamily: sansMedium, fontSize: 11, fontWeight: "600", letterSpacing: 0.4, lineHeight: 14 },
  numeric: { fontFamily: sansMedium, fontSize: 15, fontWeight: "600", fontVariant: ["tabular-nums"], lineHeight: 20 },
} satisfies Record<string, TextStyle>;

export const directional = (isRTL: boolean) =>
  ({
    textAlign: isRTL ? "right" : "left",
    writingDirection: isRTL ? "rtl" : "ltr",
  }) as const;
