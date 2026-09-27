export const themeColors: {
  primary: { light: string; dark: string };
  onPrimary: { light: string; dark: string };
  background: { light: string; dark: string };
  surface: { light: string; dark: string };
  subtle: { light: string; dark: string };
  wash: { light: string; dark: string };
  foreground: { light: string; dark: string };
  muted: { light: string; dark: string };
  border: { light: string; dark: string };
  line: { light: string; dark: string };
  highlight: { light: string; dark: string };
  coral: { light: string; dark: string };
  sky: { light: string; dark: string };
  lilac: { light: string; dark: string };
  success: { light: string; dark: string };
  warning: { light: string; dark: string };
  error: { light: string; dark: string };
};

declare const themeConfig: {
  themeColors: typeof themeColors;
};

export default themeConfig;
