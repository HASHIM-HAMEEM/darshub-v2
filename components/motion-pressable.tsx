import { Pressable, type PressableProps, type PressableStateCallbackType, StyleSheet, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";

export const pressedOpacity = (_pressed: boolean, _amount = 0.6) => 1;

type MotionPressableProps = PressableProps & { rippleBorderless?: boolean; squish?: number; tilt?: number };

const outerKeys = [
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "alignSelf",
  "position",
  "top",
  "bottom",
  "left",
  "right",
  "start",
  "end",
  "zIndex",
  "margin",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "marginHorizontal",
  "marginVertical",
  "marginStart",
  "marginEnd",
  "width",
  "maxWidth",
  "minWidth",
  "elevation",
] as const;

const idle: PressableStateCallbackType = { pressed: false, hovered: false };

export function MotionPressable({
  android_ripple: _ripple,
  rippleBorderless: _borderless,
  squish = 0.955,
  tilt = -0.8,
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: MotionPressableProps) {
  const reduce = useReducedMotion();
  const pressed = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - (1 - squish) * pressed.value }, { rotate: `${tilt * pressed.value}deg` }],
  }));
  const flat = (StyleSheet.flatten(typeof style === "function" ? style(idle) : style) ?? {}) as ViewStyle;
  const outer: ViewStyle = {};
  const outerRecord = outer as Record<string, unknown>;
  const flatRecord = flat as Record<string, unknown>;
  for (const key of outerKeys) {
    if (flatRecord[key] !== undefined) outerRecord[key] = flatRecord[key];
  }
  const stretch = outer.flex !== undefined || outer.flexGrow !== undefined || outer.width !== undefined;
  const inner = (state: PressableStateCallbackType) => {
    const resolved = (StyleSheet.flatten(typeof style === "function" ? style(state) : style) ?? {}) as Record<string, unknown>;
    const rest: Record<string, unknown> = {};
    for (const key of Object.keys(resolved)) {
      if (!(outerKeys as readonly string[]).includes(key)) rest[key] = resolved[key];
    }
    return [rest as ViewStyle, stretch && styles.fill];
  };
  return (
    <Animated.View style={[outer, animated]}>
      <Pressable
        {...props}
        disabled={disabled}
        onPressIn={(event) => {
          if (!reduce) pressed.value = withSpring(1, { damping: 16, stiffness: 520 });
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          pressed.value = withSpring(0, { damping: 9, stiffness: 300 });
          onPressOut?.(event);
        }}
        style={inner}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({ fill: { flexGrow: 1 } });
