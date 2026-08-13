import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Image, Platform, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

const darsLogo = require("../assets/images/icon.png");

export function BrandIntro() {
  const colors = useColors(); const [visible, setVisible] = useState(Platform.OS !== "web"); const [reduceMotion, setReduceMotion] = useState(false); const opacity = useRef(new Animated.Value(1)).current; const scale = useRef(new Animated.Value(0.82)).current; const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion); const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion); return () => subscription.remove(); }, []);
  useEffect(() => {
    if (!visible) return;
    const entrance = reduceMotion ? Animated.parallel([Animated.timing(scale, { duration: 1, toValue: 1, useNativeDriver: true }), Animated.timing(translateY, { duration: 1, toValue: 0, useNativeDriver: true })]) : Animated.spring(scale, { damping: 17, stiffness: 190, mass: 0.7, toValue: 1, useNativeDriver: true });
    Animated.sequence([entrance, Animated.delay(reduceMotion ? 120 : 420), Animated.timing(opacity, { duration: reduceMotion ? 1 : 280, toValue: 0, useNativeDriver: true })]).start(() => setVisible(false));
  }, [opacity, reduceMotion, scale, translateY, visible]);
  if (!visible) return null;
  return <Animated.View pointerEvents="none" style={[styles.overlay, { backgroundColor: colors.tint, opacity }]}><Animated.View style={[styles.content, { transform: [{ scale }, { translateY }] }]}><View style={[styles.mark, { backgroundColor: colors.surface }]}><Image accessibilityLabel="Dars logo" source={darsLogo} style={styles.image} /></View><Text style={[styles.wordmark, { color: colors.surface }]}>Dars</Text><Text style={[styles.tagline, { color: colors.surface }]}>Your study rhythm</Text></Animated.View></Animated.View>;
}

const styles = StyleSheet.create({ overlay: { alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0, zIndex: 50 }, content: { alignItems: "center" }, mark: { alignItems: "center", borderRadius: 32, height: 112, justifyContent: "center", width: 112 }, image: { height: 112, resizeMode: "cover", width: 112 }, wordmark: { fontSize: 28, fontWeight: "700", letterSpacing: -0.6, marginTop: 16 }, tagline: { fontSize: 12, fontWeight: "500", marginTop: 4, opacity: 0.8 } });
