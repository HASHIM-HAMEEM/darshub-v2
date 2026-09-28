import { StyleSheet, type TextStyle } from "react-native";

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, gutter: 20 } as const;

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;

export const hairline = StyleSheet.hairlineWidth;

export const touchTarget = 48;

export const ink = { stroke: 1.8, bold: 2.4, shadow: 3.5 } as const;

export const fonts = {
  hand: "Caveat_700Bold",
  handMedium: "Caveat_600SemiBold",
  handArabic: "ArefRuqaa_700Bold",
  regular: "Nunito_400Regular",
  medium: "Nunito_600SemiBold",
  bold: "Nunito_700Bold",
  heavy: "Nunito_800ExtraBold",
} as const;

export const type = {
  display: { fontFamily: fonts.hand, fontSize: 42, lineHeight: 46 },
  title: { fontFamily: fonts.hand, fontSize: 30, lineHeight: 34 },
  headline: { fontFamily: fonts.heavy, fontSize: 17, lineHeight: 23 },
  body: { fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 15.5, lineHeight: 22 },
  meta: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.heavy, fontSize: 13, letterSpacing: 0.2, lineHeight: 18 },
  caption: { fontFamily: fonts.heavy, fontSize: 11, letterSpacing: 0.8, lineHeight: 14 },
  numeric: { fontFamily: fonts.heavy, fontSize: 15, fontVariant: ["tabular-nums"], lineHeight: 20 },
} satisfies Record<string, TextStyle>;

const arabicScript = /[\u0600-\u06FF]/;

export const handFont = (text: string | undefined) => (text && arabicScript.test(text) ? fonts.handArabic : fonts.hand);

export const handStyle = (text: string | undefined, base: TextStyle): TextStyle =>
  handFont(text) === fonts.handArabic ? { ...base, fontFamily: fonts.handArabic, fontSize: (base.fontSize ?? 30) * 0.72, lineHeight: (base.lineHeight ?? 34) * 1.05 } : base;

export const directional = (isRTL: boolean) =>
  ({
    textAlign: isRTL ? "right" : "left",
    writingDirection: isRTL ? "rtl" : "ltr",
  }) as const;
