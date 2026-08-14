import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Image, Platform, StyleSheet } from "react-native";

const darsLogo = require("../assets/images/icon.png");
const launchBackground = "#1E5B4F";

export function BrandIntro() {
  const [visible, setVisible] = useState(Platform.OS !== "web"); const [reduceMotion, setReduceMotion] = useState(false); const opacity = useRef(new Animated.Value(1)).current; const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion); const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion); return () => subscription.remove(); }, []);
  useEffect(() => {
    if (!visible) return;
    const handoff = reduceMotion ? Animated.timing(opacity, { duration: 1, toValue: 0, useNativeDriver: true }) : Animated.sequence([Animated.delay(160), Animated.parallel([Animated.timing(opacity, { duration: 260, easing: Easing.out(Easing.cubic), toValue: 0, useNativeDriver: true }), Animated.timing(scale, { duration: 260, easing: Easing.out(Easing.cubic), toValue: 1.035, useNativeDriver: true })])]);
    handoff.start(() => setVisible(false));
  }, [opacity, reduceMotion, scale, visible]);
  if (!visible) return null;
  return <Animated.View pointerEvents="none" style={[styles.overlay, { backgroundColor: launchBackground, opacity }]}><Animated.View style={{ transform: [{ scale }] }}><Image accessibilityLabel="Dars logo" source={darsLogo} style={styles.image} /></Animated.View></Animated.View>;
}

const styles = StyleSheet.create({ overlay: { alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0, zIndex: 50 }, image: { height: 156, resizeMode: "cover", width: 156 } });
