import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { LanternDoodle, PaperDots, Squiggle } from "@/components/doodle";
import { fonts } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";

export function BrandIntro() {
  const colors = useColors();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(Platform.OS !== "web");
  const fade = useSharedValue(1);
  const pop = useSharedValue(reduce ? 1 : 0.6);
  useEffect(() => {
    if (!visible) return;
    const hide = () => setVisible(false);
    pop.value = withSpring(1, { damping: 9, stiffness: 180 });
    fade.value = withDelay(reduce ? 0 : 1050, withTiming(0, { duration: reduce ? 1 : 320, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(hide)();
    }));
  }, [fade, pop, reduce, visible]);
  const overlay = useAnimatedStyle(() => ({ opacity: fade.value }));
  const mark = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }, { rotate: `${(1 - pop.value) * -18}deg` }] }));
  if (!visible) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, { backgroundColor: colors.background }, overlay]}>
      <PaperDots />
      <Animated.View style={[styles.center, mark]}>
        <LanternDoodle size={132} />
        <Text accessibilityRole="header" style={[styles.word, { color: colors.text }]}>DarsHub</Text>
        <Squiggle width={150} height={12} delay={260} strokeWidth={3.4} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0, zIndex: 50 },
  center: { alignItems: "center" },
  word: { fontFamily: fonts.hand, fontSize: 54, lineHeight: 60, marginTop: 4 },
});
