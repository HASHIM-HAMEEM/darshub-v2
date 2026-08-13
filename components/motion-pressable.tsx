import { Platform, Pressable, type PressableProps, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MotionPressable(props: PressableProps) {
  if (Platform.OS === "web") return <Pressable {...props} />;
  return <NativeMotionPressable {...props} />;
}

function NativeMotionPressable({ style, onPressIn, onPressOut, ...props }: PressableProps) {
  const progress = useSharedValue(0); const reduceMotion = useReducedMotion();
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.985]) }] }));
  const resolveStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => [typeof style === "function" ? style(state) : style, animatedStyle];
  return <AnimatedPressable {...props} style={resolveStyle} onPressIn={(event) => { progress.value = reduceMotion ? 0 : withTiming(1, { duration: 110 }); onPressIn?.(event); }} onPressOut={(event) => { progress.value = reduceMotion ? 0 : withTiming(0, { duration: 170 }); onPressOut?.(event); }} />;
}
