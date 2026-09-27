import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { type ComponentProps, type ReactNode, useEffect, useMemo, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, Path, Pattern, Rect } from "react-native-svg";
import { ink } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";

type MaterialName = ComponentProps<typeof MaterialIcons>["name"];

const AnimatedPath = Animated.createAnimatedComponent(Path);

function seeded(seed: number) {
  let value = seed * 9301 + 49297;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function wobblyRect(width: number, height: number, corner: number, seed = 1, jitter = 1.1, inset = 1.5) {
  const rand = seeded(seed);
  const j = (scale = 1) => (rand() - 0.5) * 2 * jitter * scale;
  const x0 = inset;
  const y0 = inset;
  const x1 = width - inset;
  const y1 = height - inset;
  const r = Math.max(2, Math.min(corner, (x1 - x0) / 2, (y1 - y0) / 2));
  const f = (n: number) => n.toFixed(1);
  return [
    `M${f(x0 + r + j())} ${f(y0 + j(0.5))}`,
    `Q${f((x0 + x1) / 2 + j(3))} ${f(y0 + j(1.4))} ${f(x1 - r + j())} ${f(y0 + j(0.5))}`,
    `Q${f(x1 + j(0.4))} ${f(y0 + j(0.4))} ${f(x1 + j(0.5))} ${f(y0 + r + j())}`,
    `Q${f(x1 + j(1.4))} ${f((y0 + y1) / 2 + j(3))} ${f(x1 + j(0.5))} ${f(y1 - r + j())}`,
    `Q${f(x1 + j(0.4))} ${f(y1 + j(0.4))} ${f(x1 - r + j())} ${f(y1 + j(0.5))}`,
    `Q${f((x0 + x1) / 2 + j(3))} ${f(y1 + j(1.4))} ${f(x0 + r + j())} ${f(y1 + j(0.5))}`,
    `Q${f(x0 + j(0.4))} ${f(y1 + j(0.4))} ${f(x0 + j(0.5))} ${f(y1 - r + j())}`,
    `Q${f(x0 + j(1.4))} ${f((y0 + y1) / 2 + j(3))} ${f(x0 + j(0.5))} ${f(y0 + r + j())}`,
    `Q${f(x0 + j(0.4))} ${f(y0 + j(0.4))} ${f(x0 + r + 4)} ${f(y0 + j(0.3))}`,
  ].join(" ");
}

export function SketchSurface({
  children,
  style,
  fill,
  stroke,
  shadow = true,
  shadowColor,
  corner = 18,
  seed = 1,
  strokeWidth = ink.stroke,
  dashed = false,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  fill?: string;
  stroke?: string;
  shadow?: boolean;
  shadowColor?: string;
  corner?: number;
  seed?: number;
  strokeWidth?: number;
  dashed?: boolean;
}) {
  const colors = useColors();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const offset = shadow ? ink.shadow : 0;
  const path = useMemo(
    () => (size.width ? wobblyRect(size.width - offset, size.height - offset, corner, seed) : ""),
    [corner, offset, seed, size.height, size.width],
  );
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (Math.abs(width - size.width) > 0.5 || Math.abs(height - size.height) > 0.5) setSize({ width, height });
  };
  return (
    <View onLayout={onLayout} style={[surfaceStyles.stack, style]}>
      {path ? (
        <Svg pointerEvents="none" style={surfaceStyles.ink} width={size.width} height={size.height}>
          {shadow ? <Path d={path} fill={shadowColor ?? colors.line} transform={`translate(${offset}, ${offset})`} /> : null}
          <Path
            d={path}
            fill={fill ?? colors.surface}
            stroke={stroke ?? colors.line}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dashed ? "7 6" : undefined}
          />
        </Svg>
      ) : null}
      {children}
    </View>
  );
}

function wavePath(width: number, height: number, seed: number) {
  const rand = seeded(seed);
  const mid = height / 2;
  let d = `M2 ${mid.toFixed(1)}`;
  const step = 11;
  let up = true;
  for (let x = 2; x < width - step; x += step) {
    const peak = up ? 1 + rand() : height - 1 - rand();
    d += ` Q${(x + step / 2).toFixed(1)} ${peak.toFixed(1)} ${(x + step).toFixed(1)} ${(mid + (rand() - 0.5)).toFixed(1)}`;
    up = !up;
  }
  return d;
}

export function Squiggle({
  width = 96,
  height = 10,
  color,
  strokeWidth = 3,
  delay = 120,
  seed = 7,
}: {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  delay?: number;
  seed?: number;
}) {
  const colors = useColors();
  const reduce = useReducedMotion();
  const length = width * 1.6;
  const progress = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    progress.value = 0;
    progress.value = withDelay(delay, withTiming(1, { duration: 720, easing: Easing.out(Easing.cubic) }));
  }, [delay, progress, reduce, width]);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.value) }));
  const d = useMemo(() => wavePath(width, height, seed), [height, seed, width]);
  return (
    <Svg width={width} height={height} pointerEvents="none">
      <AnimatedPath
        d={d}
        fill="none"
        stroke={color ?? colors.tint}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${length} ${length}`}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}

function loopPath(size: number, seed: number) {
  const rand = seeded(seed);
  const c = size / 2;
  const points: string[] = [];
  const turns = 1.18;
  const steps = 26;
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2 * turns - Math.PI * 0.6;
    const r = c - 3 - rand() * 1.8 - (i / steps) * 1.2;
    points.push(`${(c + Math.cos(t) * r * 1.04).toFixed(1)} ${(c + Math.sin(t) * r * 0.96).toFixed(1)}`);
  }
  return `M${points[0]} ` + points.slice(1).map((point) => `L${point}`).join(" ");
}

export function ScribbleCircle({ size = 44, color, active = true, strokeWidth = 2.4, seed = 5 }: { size?: number; color?: string; active?: boolean; strokeWidth?: number; seed?: number }) {
  const colors = useColors();
  const reduce = useReducedMotion();
  const length = size * Math.PI * 1.35;
  const progress = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    progress.value = reduce ? (active ? 1 : 0) : withTiming(active ? 1 : 0, { duration: active ? 460 : 160, easing: Easing.out(Easing.quad) });
  }, [active, progress, reduce]);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.value) }));
  const d = useMemo(() => loopPath(size, seed), [seed, size]);
  return (
    <Svg width={size} height={size} pointerEvents="none" style={StyleSheet.absoluteFill}>
      <AnimatedPath
        d={d}
        fill="none"
        stroke={color ?? colors.tint}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${length} ${length}`}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}

export function HighlightBlob({ width, height, color, active = true, seed = 3 }: { width: number; height: number; color?: string; active?: boolean; seed?: number }) {
  const colors = useColors();
  const scale = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    scale.value = active ? withSpring(1, { damping: 11, stiffness: 220 }) : withTiming(0, { duration: 140 });
  }, [active, scale]);
  const style = useAnimatedStyle(() => ({ opacity: Math.min(1, scale.value * 1.4), transform: [{ scaleX: scale.value }, { scaleY: 0.6 + scale.value * 0.4 }, { rotate: "-2deg" }] }));
  const d = useMemo(() => wobblyRect(width, height, height / 2, seed, 1.6, 1), [height, seed, width]);
  return (
    <Animated.View pointerEvents="none" style={[{ height, width }, styles.blob, style]}>
      <Svg width={width} height={height}>
        <Path d={d} fill={color ?? colors.highlight} />
      </Svg>
    </Animated.View>
  );
}

export function PaperDots() {
  const colors = useColors();
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <Pattern id="paper-dots" width={22} height={22} patternUnits="userSpaceOnUse">
          <Circle cx={2} cy={2} r={1} fill={colors.border} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#paper-dots)" />
    </Svg>
  );
}

const glyphs = {
  home: "M3.5 11.2 L12 4 L20.6 11 M5.8 9.6 V19.6 Q5.8 20.3 6.5 20.3 H17.6 Q18.3 20.3 18.3 19.6 V9.4 M10 20.2 V14.6 Q10 14 10.6 14 H13.5 Q14.1 14 14.1 14.6 V20.2",
  calendar: "M4.5 7 Q4.4 5.4 6 5.5 H18.2 Q19.6 5.4 19.5 7 V18.6 Q19.6 20.1 18 20 H6 Q4.4 20.1 4.5 18.5 Z M4.6 9.8 H19.4 M8.5 3.4 V7 M15.6 3.3 V7 M8 13.4 h.1 M12 13.4 h.1 M16 13.4 h.1 M8 16.8 h.1 M12 16.8 h.1",
  bookmark: "M6.5 4.2 H17.4 Q18 4.2 18 4.8 V20.2 L12.1 16.1 L6 20.3 V4.8 Q6 4.2 6.5 4.2 Z",
  search: "M4.2 10.6 a6.4 6.4 0 1 0 12.8 0 a6.4 6.4 0 1 0 -12.8 0 M15.4 15.5 L20.2 20.2",
  sliders: "M4 7 H13 M17 7 H20 M15 4.8 V9.2 M4 12 H7 M11 12 H20 M9 9.8 V14.2 M4 17 H14 M18 17 H20 M16 14.8 V19.2",
  add: "M12 4.6 Q11.8 12 12.2 19.4 M4.6 12.1 Q12 11.7 19.4 12",
  close: "M6 6.2 Q12 11.8 18 17.8 M17.9 6 Q12 12.2 6.1 18",
  check: "M4.8 12.6 L9.6 17.4 L19.4 6.4",
  back: "M19.5 12.2 Q12 11.8 4.8 12 M10.4 6.2 L4.6 12 L10.6 17.8",
  forward: "M4.5 12.2 Q12 11.8 19.2 12 M13.6 6.2 L19.4 12 L13.4 17.8",
  right: "M9.2 5.8 L15.4 12 L9.4 18.2",
  left: "M14.8 5.8 L8.6 12 L14.6 18.2",
  down: "M5.8 9.2 L12 15.4 L18.2 9.4",
  updown: "M7.6 9.4 L12 5.2 L16.4 9.4 M7.6 14.6 L12 18.8 L16.4 14.6",
  book: "M12 6.6 Q8.4 4.4 3.8 5 V18.4 Q8.4 17.8 12 20 Q15.6 17.8 20.2 18.4 V5 Q15.6 4.4 12 6.6 Z M12 6.6 V19.8",
  pin: "M12 20.6 Q5.4 14 5.6 9.6 A6.4 6.4 0 0 1 18.4 9.6 Q18.6 14 12 20.6 Z M10 9.6 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0",
  map: "M3.8 6.4 L9 4.4 L15 6.6 L20.2 4.6 V17.6 L15 19.6 L9 17.4 L3.8 19.4 Z M9 4.4 V17.4 M15 6.6 V19.6",
  person: "M8.4 8.2 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 M4.8 20 Q5.4 14.2 12 14 Q18.6 14.2 19.2 20",
  groups: "M5.6 9 a2.8 2.8 0 1 0 5.6 0 a2.8 2.8 0 1 0 -5.6 0 M13.4 8 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0 M2.8 19 Q3.4 14.4 8.4 14.2 Q13.4 14.4 14 19 M14.6 13.4 Q20.4 13 21.2 18",
  clock: "M3.8 12 a8.2 8.2 0 1 0 16.4 0 a8.2 8.2 0 1 0 -16.4 0 M12 7.2 V12.2 L15.2 14.2",
  bell: "M6.2 16.6 V11 Q6.2 5.4 12 5.2 Q17.8 5.4 17.8 11 V16.6 L19.4 18 H4.6 Z M10 20.2 Q12 21.6 14 20.2 M12 3.2 V5.2",
  edit: "M4.6 19.4 L5.4 15.4 L15.8 5 Q17 3.8 18.2 5 L19 5.8 Q20.2 7 19 8.2 L8.6 18.6 Z M14 6.8 L17.2 10",
  trash: "M4.6 7 H19.4 M9.4 7 V4.8 H14.6 V7 M6.4 7 L7.4 19.4 Q7.5 20.2 8.3 20.2 H15.7 Q16.5 20.2 16.6 19.4 L17.6 7 M10.2 10.6 V16.6 M13.8 10.6 V16.6",
  share: "M12 14.6 V3.8 M7.8 8 L12 3.8 L16.2 8 M7 11 H5.6 V20 H18.4 V11 H17",
  repeat: "M5 11 Q5 6.6 9.6 6.6 H18.4 M15.6 3.8 L18.4 6.6 L15.6 9.4 M19 13 Q19 17.4 14.4 17.4 H5.6 M8.4 14.6 L5.6 17.4 L8.4 20.2",
  translate: "M3.8 5.8 H13 M8.4 3.8 V5.8 M11 5.8 Q9.6 11.4 4.6 14 M6.6 9 Q8.6 12 12 13.4 M12.4 20.2 L16.2 10.8 L20.2 20.2 M13.6 17.4 H18.8",
  palette: "M12 3.8 Q20.2 3.8 20.2 11.4 Q20.2 15 16.8 15 H15 Q13.4 15.2 14 16.8 Q14.8 19.4 12 20.2 Q3.8 20 3.8 12 Q4 4 12 3.8 Z M8 11 h.1 M11 7.6 h.1 M15.4 8.4 h.1",
  sun: "M8.4 12 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 M12 2.8 V5 M12 19 V21.2 M2.8 12 H5 M19 12 H21.2 M5.4 5.4 L7 7 M17 17 L18.6 18.6 M5.4 18.6 L7 17 M17 7 L18.6 5.4",
  moon: "M19.6 14.6 Q17.4 16.4 14.4 16 Q8.6 15 8.2 9.2 Q8.2 6.4 10 4.4 Q4.2 5.8 4.4 12.2 Q5 19.4 12.2 19.6 Q17.2 19.4 19.6 14.6 Z",
  auto: "M3.8 12 a8.2 8.2 0 1 0 16.4 0 a8.2 8.2 0 1 0 -16.4 0 M12 3.8 V20.2 M13.6 7 L17 7.8 M13.6 10.6 H18.6 M13.6 14.2 L18 14.8 M13.6 17.4 L16.4 17",
  info: "M3.8 12 a8.2 8.2 0 1 0 16.4 0 a8.2 8.2 0 1 0 -16.4 0 M12 11 V16.4 M12 7.8 h.1",
  alert: "M3.8 12 a8.2 8.2 0 1 0 16.4 0 a8.2 8.2 0 1 0 -16.4 0 M12 7.4 V12.8 M12 16.2 h.1",
  refresh: "M5 12.4 Q5.2 5.2 12.2 5 Q18.8 5.4 19 12 Q18.8 18.8 12 19 Q8 18.9 6 16 M5 7.4 V12.4 H10",
  notes: "M5.2 4.4 H15.4 L19 8 V19.6 H5.2 Z M15.2 4.6 V8.2 H18.8 M8.4 12 H15.6 M8.4 15.6 H13.8",
  globe: "M3.8 12 a8.2 8.2 0 1 0 16.4 0 a8.2 8.2 0 1 0 -16.4 0 M3.9 12 H20.1 M12 3.8 Q7.4 12 12 20.2 Q16.6 12 12 3.8",
  call: "M6.6 3.8 L9.4 4.2 L10.6 8.4 L8.6 10 Q10.6 13.8 14 15.4 L15.6 13.4 L19.8 14.6 L20.2 17.4 Q19.8 20.2 16.8 20.2 Q4 19 3.8 7.2 Q3.8 4 6.6 3.8 Z",
  star: "M12 3.4 L14.4 8.6 L20 9.2 L15.8 13 L17 18.6 L12 15.8 L7 18.6 L8.2 13 L4 9.2 L9.6 8.6 Z",
  cloudOff: "M7 18.4 Q3.6 18.2 3.8 14.8 Q4.2 11.6 7.4 11.6 Q8.2 6.8 12.8 6.8 Q17.4 7 18 11.6 Q20.6 12 20.4 15 Q20.2 18.4 17 18.4 Z M4.2 4.2 L19.8 19.8",
  cancel: "M3.8 12 a8.2 8.2 0 1 0 16.4 0 a8.2 8.2 0 1 0 -16.4 0 M9 9 L15 15 M15 9 L9 15",
  undo: "M9 5.6 L4.8 9.8 L9 14 M5 9.8 H14.4 Q19.4 10 19.4 14.8 Q19.2 19.4 14.4 19.4 H9.6",
} as const;

type Glyph = keyof typeof glyphs;

const aliases: Partial<Record<MaterialName, Glyph>> = {
  home: "home",
  "home-filled": "home",
  "calendar-today": "calendar",
  event: "calendar",
  today: "calendar",
  "edit-calendar": "calendar",
  "event-available": "calendar",
  "event-busy": "calendar",
  bookmark: "bookmark",
  "bookmark-border": "bookmark",
  search: "search",
  "search-off": "search",
  settings: "sliders",
  tune: "sliders",
  add: "add",
  close: "close",
  check: "check",
  "arrow-back": "back",
  "arrow-forward": "forward",
  "chevron-right": "right",
  "chevron-left": "left",
  "expand-more": "down",
  "unfold-more": "updown",
  "menu-book": "book",
  "auto-stories": "book",
  "library-add": "book",
  "location-on": "pin",
  place: "pin",
  map: "map",
  signpost: "map",
  person: "person",
  "person-outline": "person",
  groups: "groups",
  schedule: "clock",
  timer: "clock",
  "notifications-none": "bell",
  edit: "edit",
  "delete-outline": "trash",
  share: "share",
  "ios-share": "share",
  repeat: "repeat",
  translate: "translate",
  palette: "palette",
  "light-mode": "sun",
  "dark-mode": "moon",
  "brightness-auto": "auto",
  "info-outline": "info",
  "error-outline": "alert",
  restore: "refresh",
  refresh: "refresh",
  "sync-problem": "refresh",
  notes: "notes",
  public: "globe",
  call: "call",
  verified: "star",
  "cloud-off": "cloudOff",
  cancel: "cancel",
  undo: "undo",
};

export function Icon({ name, size = 24, color, strokeWidth = 1.9 }: { name: MaterialName; size?: number; color?: string; strokeWidth?: number }) {
  const colors = useColors();
  const glyph = aliases[name];
  const tint = color ?? colors.text;
  if (!glyph) return <MaterialIcons name={name} size={size} color={tint} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" pointerEvents="none">
      <Path d={glyphs[glyph]} fill="none" stroke={tint} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function useFloat(amplitude = 4, duration = 1800) {
  const reduce = useReducedMotion();
  const value = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    value.value = withRepeat(withSequence(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })), -1);
  }, [duration, reduce, value]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: -amplitude * value.value }, { rotate: `${(value.value - 0.5) * 4}deg` }] }));
}

function Twinkle({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) {
  const reduce = useReducedMotion();
  const value = useSharedValue(1);
  useEffect(() => {
    if (reduce) return;
    value.value = withDelay(delay, withRepeat(withSequence(withTiming(0.35, { duration: 700 }), withTiming(1, { duration: 700 })), -1));
  }, [delay, reduce, value]);
  const style = useAnimatedStyle(() => ({ opacity: value.value, transform: [{ scale: 0.7 + value.value * 0.3 }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ height: size, left: x, position: "absolute", top: y, width: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M12 2 Q13 11 22 12 Q13 13 12 22 Q11 13 2 12 Q11 11 12 2 Z" fill={color} />
      </Svg>
    </Animated.View>
  );
}

export function LanternDoodle({ size = 120 }: { size?: number }) {
  const colors = useColors();
  const float = useFloat();
  const s = size / 120;
  return (
    <View style={{ height: size, width: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, float]}>
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Path d="M60 2 V20" stroke={colors.line} strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M52 22 Q60 14 68 22 Z" fill={colors.line} />
          <Path d="M44 30 Q60 18 76 30 L72 34 H48 Z" fill={colors.highlight} stroke={colors.line} strokeWidth={2.2} strokeLinejoin="round" />
          <Path d="M47 34 Q36 58 46 84 H74 Q84 58 73 34 Z" fill={colors.surface} stroke={colors.line} strokeWidth={2.4} strokeLinejoin="round" />
          <Path d="M60 44 Q52 58 60 72 Q68 58 60 44 Z" fill={colors.coral} stroke={colors.line} strokeWidth={1.8} />
          <Path d="M50 40 Q45 58 51 78 M70 40 Q75 58 69 78" fill="none" stroke={colors.line} strokeWidth={1.4} strokeDasharray="3 4" strokeLinecap="round" />
          <Path d="M44 84 H76 L72 92 H48 Z" fill={colors.highlight} stroke={colors.line} strokeWidth={2.2} strokeLinejoin="round" />
          <Path d="M60 92 V104 M56 104 H64" stroke={colors.line} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </Animated.View>
      <Twinkle x={8 * s} y={22 * s} size={16 * s} color={colors.highlight} delay={0} />
      <Twinkle x={92 * s} y={40 * s} size={12 * s} color={colors.tint} delay={400} />
      <Twinkle x={18 * s} y={80 * s} size={10 * s} color={colors.lilac} delay={800} />
    </View>
  );
}

export function BooksDoodle({ size = 120 }: { size?: number }) {
  const colors = useColors();
  const float = useFloat(3, 2200);
  const s = size / 120;
  return (
    <View style={{ height: size, width: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, float]}>
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Path d="M22 92 Q60 96 98 92 L96 104 Q60 108 24 104 Z" fill={colors.sky} stroke={colors.line} strokeWidth={2.2} strokeLinejoin="round" />
          <Path d="M28 76 Q62 80 92 76 L94 92 Q60 96 26 92 Z" fill={colors.coral} stroke={colors.line} strokeWidth={2.2} strokeLinejoin="round" />
          <Path d="M34 84 H86" stroke={colors.line} strokeWidth={1.6} strokeDasharray="4 4" strokeLinecap="round" />
          <Path d="M60 36 Q42 28 26 32 V70 Q42 66 60 74 Q78 66 94 70 V32 Q78 28 60 36 Z" fill={colors.surface} stroke={colors.line} strokeWidth={2.4} strokeLinejoin="round" />
          <Path d="M60 36 V74" stroke={colors.line} strokeWidth={2} />
          <Path d="M34 44 Q44 42 52 46 M34 52 Q44 50 52 54 M68 46 Q76 42 86 44 M68 54 Q76 50 86 52" fill="none" stroke={colors.muted} strokeWidth={1.6} strokeLinecap="round" />
          <Path d="M78 30 V46 L82 42 L86 46 V30" fill={colors.tint} stroke={colors.line} strokeWidth={1.6} strokeLinejoin="round" />
        </Svg>
      </Animated.View>
      <Twinkle x={6 * s} y={20 * s} size={14 * s} color={colors.highlight} delay={200} />
      <Twinkle x={98 * s} y={12 * s} size={12 * s} color={colors.lilac} delay={700} />
    </View>
  );
}

export function Tape({ color, style }: { color?: string; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return <View pointerEvents="none" style={[styles.tape, { backgroundColor: color ?? colors.highlight }, style]} />;
}

export const subjectInk = (subject: string, palette: { highlight: string; coral: string; sky: string; lilac: string; wash: string }) => {
  const choices = [palette.wash, palette.highlight, palette.sky, palette.coral, palette.lilac];
  let hash = 0;
  for (const char of subject) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return choices[hash % choices.length];
};

const styles = StyleSheet.create({
  blob: { position: "absolute" },
  tape: { height: 22, opacity: 0.78, position: "absolute", width: 78 },
});

const surfaceStyles = StyleSheet.create({
  stack: { position: "relative", zIndex: 0 },
  ink: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
});
